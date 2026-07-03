# Build the Docker image
# -t: Tag the image with a name (todo-app)
# .: Use the Dockerfile in the current directory
sudo docker build -t todo-app .

# Run the container
# -p: Map port 8000 on your computer to port 8000 in the container
# -d: Run in detached mode (background)
# --name: Give the container a name
sudo docker run -d -p 8000:8000 --name my-todo todo-app

# Test it: Open your browser and go to http://localhost:8000/docs
# You'll see the interactive Swagger documentation!

# Stop the container
sudo docker stop my-todo

# Remove the container
sudo docker rm my-todo




#
git init

#
git commit -m "first commit"

#
git remote add origin https://github.com/jaanbrigithjb-lab/todo-app.git

#
git branch -M main

#
git push -u origin main
