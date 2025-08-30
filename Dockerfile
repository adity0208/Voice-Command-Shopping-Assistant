# Step 1: Choose the base image.
# We use Python 3.9-slim as it provides a smaller, more secure foundation.
FROM python:3.9-slim

# Step 2: Set the working directory inside the container.
# All subsequent commands will be run from this path.
WORKDIR /app

# Step 3: Copy the requirements file first to leverage Docker's layer cache.
# This way, dependencies are only re-installed if requirements.txt changes.
COPY requirements.txt .

# Step 4: Install the Python dependencies.
# --no-cache-dir is used to reduce the final image size by not storing the download cache.
RUN pip install --no-cache-dir -r requirements.txt

# Step 5: Copy the rest of the application's source code.
# This is done after installing dependencies to optimize build times.
COPY . .

# Step 6: Create and switch to a non-root user for security best practices.
# This prevents the application from running with root privileges inside the container.
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Step 7: Expose port 8080.
# This informs Docker that the container listens on this network port at runtime.
EXPOSE 8080

# Step 8: Define the command to run the application using Gunicorn.
# This starts the web server, listening on all available network interfaces on port 8080.
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]