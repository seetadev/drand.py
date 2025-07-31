"""Configuration file parsing utilities."""

from pathlib import Path
import toml


def parse_toml(toml_file):
    """Parse a TOML configuration file.

    Args:
        toml_file (str|Path): Path to the TOML file

    Returns:
        dict: Parsed TOML data

    Raises:
        FileNotFoundError: If file doesn't exist
        toml.TomlDecodeError: If file is not valid TOML
    """
    return toml.loads(Path(toml_file).read_text())


def get_addresses_from_group_file(group_file):
    """Extract node addresses from a drand group TOML file.

    Args:
        group_file (str|Path): Path to the group TOML file

    Returns:
        list: List of node addresses
    """
    group = parse_toml(group_file)
    return [node["Address"] for node in group["Nodes"]]


def load_config(config_file, section=None):
    """Load configuration from a TOML file.

    Args:
        config_file (str|Path): Path to the configuration file
        section (str, optional): Specific section to load

    Returns:
        dict: Configuration data
    """
    config = parse_toml(config_file)
    return config.get(section, config) if section else config
