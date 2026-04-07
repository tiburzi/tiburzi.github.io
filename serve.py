from livereload import Server
import os

server = Server()
root = os.path.abspath('.')
server.watch(root)                    # watch all files
server.serve(root=root, port=8000, host='localhost')