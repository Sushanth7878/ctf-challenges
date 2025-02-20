document.getElementById("execute").addEventListener("click", function () {
    let command = document.getElementById("command").value.trim();
    let terminalOutput = document.getElementById("output");
    let currentDir = document.getElementById("currentDir").innerText;

    if (command === "cat flag.txt") {
        if (currentDir === "/home/ctf") {
            terminalOutput.innerHTML += "cat: flag.txt: No such file or directory<br>";
        } else if (currentDir === "/home/ctf/secrets") {
            terminalOutput.innerHTML += "Access Denied<br>";
        }
        return;
    }

    fetch('/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: command })
    })
    .then(response => response.json())
    .then(data => {
        terminalOutput.innerHTML += data.output + "<br>";

        // Update directory tracking if user navigates
        if (command.startsWith("cd ")) {
            let newDir = command.split(" ")[1];
            if (newDir === "..") {
                document.getElementById("currentDir").innerText = "/home/ctf";
            } else if (newDir === "secrets") {
                document.getElementById("currentDir").innerText = "/home/ctf/secrets";
            }
        }
    });

    document.getElementById("command").value = ""; // Clear input field after command execution
});