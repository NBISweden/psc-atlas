# PSC Atlas, backend

## Python module management

The Python modules used in this project are managed with
[uv](https://pypi.org/project/uv/).

### Setting up and activating the environment

To set up the Python environment, run the command:

``` bash
uv sync
```

To activate the environment, run the command:

``` bash
source .venv/bin/activate
```

To deactivate the environment, run the command:

``` bash
deactivate
```

### Adding or removing dependencies

To add a new dependency, use the command:

``` bash
uv add {package-name}
```

To remove a dependency, use the command:

``` bash
uv remove {package-name}
```

To update all dependencies to their latest versions, use the command:

``` bash
uv lock --update
```

To synchronize the environment with dependencies listed in
`pyproject.toml`, use the command:

``` bash
uv sync
```
