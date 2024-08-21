build:
	python -m build -s
	python -m build

publish:
	python -m twine upload --verbose dist/*
