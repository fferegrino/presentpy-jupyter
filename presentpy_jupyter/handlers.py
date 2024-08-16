import json
import subprocess
import tempfile
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
from pathlib import Path

class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def post(self):
        data = json.loads(self.request.body.decode('utf-8'))
        notebook_path = data['path']
        notebook_path = Path(notebook_path)

        output_name = notebook_path.stem + ".odp"
        self.set_header('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation')
        self.set_header('Content-Disposition', f'attachment; filename="{output_name}"')
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            subprocess.run(["presentpy", notebook_path, "--output", tmp.name])
            tmp.seek(0)
            self.write(tmp.read())


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "presentpy-jupyter", "download")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
