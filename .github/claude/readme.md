# drand.py

A Python client library for interacting with the drand distributed randomness beacon network. This library provides a simple and efficient way to fetch verifiable randomness from drand networks, with support for both public and private drand chains.

## 🚀 Features

- **Distributed Randomness Access**: Connect to drand networks to fetch cryptographically secure randomness
- **Multiple Network Support**: Works with various drand networks and chains
- **Verification Capabilities**: Built-in verification of randomness beacon signatures
- **Docker Support**: Complete containerized development and deployment environment
- **Development Network**: Includes a local 5-node drand network for testing and development
- **REST API Integration**: Seamless integration with drand's HTTP API endpoints
- **Comprehensive Documentation**: Full Sphinx documentation with examples

## 🛠️ Tech Stack

### Backend/Core
- **Python 3.x**: Main programming language
- **drand Protocol**: Distributed randomness beacon protocol
- **Cryptographic Libraries**: For signature verification and randomness validation

### Development Tools
- **Docker & Docker Compose**: Containerized development environment
- **Sphinx**: Documentation generation
- **Make**: Build automation
- **pytest**: Testing framework (configured)

### Infrastructure
- **nginx**: Web server for documentation hosting
- **Multi-container Setup**: 5-node drand network for local development

## 📁 Project Structure

```
drand.py/
├── drand/                    # Main Python package
│   ├── __init__.py          # Package initialization
│   ├── constants.py         # Configuration constants
│   ├── drand.py            # Core drand client implementation
│   ├── exceptions.py       # Custom exception classes
│   └── utils.py            # Utility functions
├── devnet/                  # Local development network
│   ├── data/               # Network configuration and scripts
│   ├── docker-compose.yml  # 5-node drand network setup
│   └── run.sh              # Network startup script
├── tests/                   # Test suite
├── docs/                    # Sphinx documentation
└── Docker configuration files
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.7 or higher
- Docker (>= 17.12) and Docker Compose (>= 1.18) for development network
- pip package manager

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/anisharma07/drand.py.git
cd drand.py

# Install in development mode
pip install --editable .[dev]

# Or install from source
python setup.py install
```

### Docker Development Setup

```bash
# Build and run the development environment
docker-compose up -d

# For interactive development
docker-compose run --rm drand python
```

## 🎯 Usage

### Basic Usage

```python
from drand import DrandClient

# Initialize client
client = DrandClient()

# Fetch latest randomness
randomness = client.get_latest()
print(f"Random value: {randomness}")

# Fetch specific round
round_randomness = client.get_round(12345)
print(f"Round 12345: {round_randomness}")
```

### Development Network

Start a local 5-node drand network for testing:

```bash
cd devnet
./run.sh
```

This creates a threshold network (3 out of 5 nodes) with 10-second randomness periods.

### API Interaction

Query the development network directly:

```bash
# Linux/macOS
curl CONTAINER_IP:8080/api/public

# Alternative (works on all platforms)
docker exec drand1 call_api
```

### Production Usage

```bash
# Connect to mainnet drand network
python -c "
from drand import DrandClient
client = DrandClient(network='mainnet')
print(client.get_latest())
"
```

## 📱 Platform Support

- **Linux**: Full support with native Docker integration
- **macOS**: Supported with Docker for Mac (note: direct container IP access limitations)
- **Windows**: Supported via Docker Desktop
- **Python Versions**: 3.7, 3.8, 3.9, 3.10, 3.11+

## 🧪 Testing

```bash
# Run the test suite
python -m pytest tests/

# Run tests in Docker
docker-compose run --rm drand python -m pytest tests/

# Run with coverage
python -m pytest tests/ --cov=drand
```

## 📚 Documentation

Build and view documentation locally:

```bash
# Build documentation
docker-compose -f docs.yml run --rm builddocs

# Serve documentation
docker-compose -f docs.yml up viewdocs

# Access at http://localhost:57781
```

## 🔄 Deployment

### Docker Deployment

```bash
# Build production image
docker build -t drand-py .

# Run in production
docker run -d --name drand-client drand-py
```

### PyPI Package

```bash
# Build distribution
python setup.py sdist bdist_wheel

# Upload to PyPI
twine upload dist/*
```

## 📊 Performance & Optimization

- **Efficient HTTP Client**: Optimized for drand's REST API
- **Connection Pooling**: Reuses connections for multiple requests
- **Caching Support**: Built-in caching for frequently accessed rounds
- **Async Support**: Non-blocking operations for high-throughput applications
- **Minimal Dependencies**: Lightweight with minimal external dependencies

## 🛡️ Security Considerations

- **Signature Verification**: All randomness beacons are cryptographically verified
- **Network Security**: Support for TLS-encrypted connections
- **Chain Verification**: Validates the integrity of randomness chains
- **Trusted Setup**: Uses well-established drand networks with known public keys

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Python PEP 8 style guidelines
- Write tests for new functionality
- Update documentation for API changes
- Test with the local devnet before submitting
- Ensure Docker builds complete successfully

### Setting Up Development Environment

```bash
# Install development dependencies
pip install --editable .[dev]

# Start local drand network
cd devnet && ./run.sh

# Run tests
python -m pytest tests/

# Check code style
flake8 drand/
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2020, Sylvain Bellemare

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 🙏 Acknowledgments

- **drand Team**: For creating and maintaining the drand distributed randomness protocol
- **League of Entropy**: For operating the public drand networks
- **Python Community**: For the excellent ecosystem of cryptographic libraries
- **Docker Community**: For containerization tools that make development easier

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/anisharma07/drand.py/issues)
- **Documentation**: Built-in Sphinx documentation (see docs/ directory)
- **drand Protocol**: [Official drand documentation](https://drand.love/)
- **Community**: Join the drand community for protocol-level discussions

### Getting Help

1. Check the documentation in the `docs/` directory
2. Try the development network in `devnet/` for testing
3. Search existing GitHub issues
4. Create a new issue with detailed information about your problem

---

*Built with ❤️ for the decentralized randomness community*