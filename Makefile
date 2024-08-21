build:
	python -m build -s
	python -m build

publish:
	python -m twine upload --verbose dist/*

patch:
	bump-my-version bump patch

minor:
	bump-my-version bump minor

major:
	bump-my-version bump major
