import json
import subprocess
from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado
import os
from pathlib import Path


class RouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def post(self):
        data = json.loads(self.request.body.decode("utf-8"))
        notebook_path = Path(data["path"])
        theme = data["theme"]
        keep_odp = data["keep_odp"]

        output_name = notebook_path.stem + ".odp"
        self.set_header("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation")
        self.set_header("Content-Disposition", f'attachment; filename="{output_name}"')

        subprocess.run(["presentpy", notebook_path, "--output", notebook_path.parent / output_name, "--theme", theme])

        with open(notebook_path.parent / output_name, "rb") as f:
            self.write(f.read())

        if not keep_odp:
            os.remove(notebook_path.parent / output_name)


def setup_handlers(web_app):
    host_pattern = ".*$"

    base_url = web_app.settings["base_url"]
    route_pattern = url_path_join(base_url, "presentpy-jupyter", "download")
    handlers = [(route_pattern, RouteHandler)]
    web_app.add_handlers(host_pattern, handlers)
