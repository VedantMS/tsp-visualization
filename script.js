var inputs = [];
var matrix = [];

function createMatrix() {
    const n = Number(document.getElementById("n").value);
    const matrixInputs = document.getElementById("matrixInputs");
    const result = document.getElementById("result");
    const error = document.getElementById("error");
    const submitBtn = document.getElementById("submitBtn");

    matrixInputs.innerHTML = "";
    result.innerHTML = "";
    error.textContent = "";
    submitBtn.style.display = "none";

    inputs = [];
    matrix = [];

    if (!Number.isInteger(n) || n < 1 || n > 30) {
        error.textContent = "Enter an integer between 1 and 30.";
        return;
    }

    for (let i = 0; i < n; i++) {
        const row = document.createElement("div");
        row.className = "matrix-row";

        inputs[i] = [];
        matrix[i] = [];

        for (let j = 0; j < n; j++) {
            const input = document.createElement("input");
            input.type = "number";
            input.step = "any";
            input.placeholder = `${i + 1},${j + 1}`;
            input.setAttribute(
                "aria-label",
                `Row ${i + 1}, column ${j + 1}`
            );

            inputs[i][j] = input;
            row.appendChild(input);
        }

        matrixInputs.appendChild(row);
    }

    submitBtn.style.display = "inline-block";
}

function displayMatrix() {
    const n = inputs.length;
    const result = document.getElementById("result");
    const error = document.getElementById("error");

    error.textContent = "";
    result.innerHTML = "";

    matrix = [];

    for (let i = 0; i < n; i++) {
        matrix[i] = [];

        for (let j = 0; j < n; j++) {
            const value = inputs[i][j].value.trim();

            if (value === "" || !Number.isFinite(Number(value))) {
                error.textContent =
                    `Enter a valid number at row ${i + 1}, column ${j + 1}.`;
                inputs[i][j].focus();
                return;
            }

            matrix[i][j] = Number(value);
        }
    }

    const table = document.createElement("table");
    const header = table.createTHead().insertRow();
    header.insertCell().textContent = "Vertex";

    for (let j = 0; j < n; j++) {
        const th = document.createElement("th");
        th.textContent = `V${j + 1}`;
        header.appendChild(th);
    }

    const tbody = table.createTBody();

    for (let i = 0; i < n; i++) {
        const tr = tbody.insertRow();
        tr.insertCell().textContent = `V${i + 1}`;

        for (let j = 0; j < n; j++) {
            tr.insertCell().textContent = matrix[i][j];
        }
    }

    result.appendChild(table);

    const heading = document.createElement("h3");
    heading.textContent = "Adjacency Matrix";
    result.prepend(heading);

    console.log(matrix);

    document.getElementById("bab").hidden = false;
    document.getElementById("dp").hidden = false;
}