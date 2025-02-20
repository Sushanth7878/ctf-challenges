from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# Simulated filesystem
filesystem = {
    "/home/ctf": ["script.py", "secrets"],
    "/home/ctf/secrets": ["flag.txt"]
}

# Track user sessions (current directory)
user_sessions = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/execute', methods=['POST'])
def execute_command():
    user_id = request.remote_addr  # Identify users by IP (or use sessions)
    
    if user_id not in user_sessions:
        user_sessions[user_id] = "/home/ctf"  # Default directory

    current_dir = user_sessions[user_id]
    command = request.json.get("command", "").strip()

    if command == "pwd":
        return jsonify(output=current_dir)

    elif command == "ls":
        return jsonify(output="\n".join(filesystem.get(current_dir, [])))

    elif command.startswith("cd "):
        target = command.split(" ", 1)[1]
        if target == "..":
            if current_dir != "/home/ctf":
                user_sessions[user_id] = "/home/ctf"
        elif target in filesystem.get(current_dir, []):
            new_path = f"{current_dir}/{target}"
            if new_path in filesystem:
                user_sessions[user_id] = new_path
        return jsonify(output="")  # Linux doesn't show output for successful cd

    elif command.startswith("file "):
        target = command.split(" ", 1)[1]
        if target in filesystem.get(current_dir, []):
            return jsonify(output=f"{target}: ASCII text")
        return jsonify(output="file not found")

    elif command == "whoami":
        return jsonify(output="ctf-user")

    elif command == "cat flag.txt":
        # Flag is only retrievable when manually bypassing frontend validation
        if current_dir == "/home/ctf/secrets":
            return jsonify(output="h4cktf1{m44m4_gy4n_m4th_d3n4_012019}")

    return jsonify(output="Invalid command")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=4000)