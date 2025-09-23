# Use official Python slim image as base for smaller image size
FROM python:3.12-slim-bookworm

# Set environment variables:
# - PYTHONDONTWRITEBYTECODE: prevents Python from writing .pyc files (bytecode)
# - PYTHONUNBUFFERED: forces stdout and stderr to be unbuffered (helps with logging)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set working directory inside the container
WORKDIR /app

# Install system dependencies needed to build some Python packages
# Clean apt cache after installation to keep image size small
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy only requirements.txt first to leverage Docker cache
# This means dependencies are only reinstalled if requirements.txt changes
COPY requirements.txt /app/

# Upgrade pip and install Python dependencies listed in requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Now copy the rest of the application source code
COPY . /app

# (Optional) Create a non-root user for improved security
# RUN useradd -m appuser
# USER appuser

# Specify the command to run the FastAPI app with uvicorn server,
# binding it to all network interfaces inside the container on port 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]