const apiUrl = "http://127.0.0.1:5000";

async function startSimulation() {
    console.log("Start button clicked");
    try {
        const response = await fetch(`${apiUrl}/start`);
        const data = await response.json();
        appendRow(data); // Add row to the table
    } catch (error) {
        console.error("Error in startSimulation:", error);
    }
}

async function nextSimulation() {
    console.log("Next button clicked");
    try {
        const response = await fetch(`${apiUrl}/next`);
        const data = await response.json();

        if (data.message) {
            // If simulation ends, show a message
            alert(data.message);
        } else {
            appendRow(data); // Add row to the table
        }
    } catch (error) {
        console.error("Error in nextSimulation:", error);
    }
}

let currentRow; // Track the current row being processed
let predictionCounter = 0; // Unique counter for each prediction row

async function pauseForPrediction() {
    console.log("Pausing for prediction...");
    try {
        const response = await fetch(`${apiUrl}/predict`, { method: 'POST' });
        const predictions = await response.json();

        // Create a dedicated prediction row below the current row
        if (currentRow) {
            const tableBody = document.querySelector("#playDataTable tbody");
            const predictionRow = document.createElement("tr");

            predictionCounter++; // Increment the prediction counter
            predictionRow.id = `predictionRow-${predictionCounter}`; // Assign unique ID

            for (let i = 0; i < 12; i++) {
                const cell = document.createElement("td");

                if (i === 6) { // Add predictions under the Pitch Type column
                    cell.colSpan = 1;
                    cell.innerHTML = predictions.map(p => `<span class="prediction">${p}</span>`).join(" | ");
                } else {
                    cell.innerHTML = ""; // Empty cells for other columns
                }

                predictionRow.appendChild(cell);
            }

            // Insert the prediction row below the current row
            tableBody.insertBefore(predictionRow, currentRow.nextSibling);
        }
    } catch (error) {
        console.error("Error in pauseForPrediction:", error);
    }
}

async function resumeSimulation() {
    console.log("Resuming simulation...");
    try {
        const response = await fetch(`${apiUrl}/resume`, { method: 'POST' });
        const data = await response.json();
        const correctPitch = data.correct_pitch;

        // Highlight predictions based on correctness
        const predictionRow = document.getElementById(`predictionRow-${predictionCounter}`); // Use unique ID
        if (predictionRow) {
            const predictionCell = predictionRow.children[6]; // 6 is the Pitch Type column
            const predictions = predictionCell.querySelectorAll(".prediction");
            let correctFound = false;

            predictions.forEach(pred => {
                if (pred.textContent === correctPitch) {
                    pred.style.color = "green"; // Correct prediction
                    correctFound = true;
                } else {
                    pred.style.color = "red"; // Incorrect predictions
                }
            });

            // If no prediction was correct, mark all as red
            if (!correctFound) {
                predictions.forEach(pred => {
                    pred.style.color = "red";
                });
            }
        }

        // Fetch and display the next row
        const nextRowResponse = await fetch(`${apiUrl}/next`);
        const nextRowData = await nextRowResponse.json();

        if (nextRowData.message) {
            alert(nextRowData.message); // End of simulation
        } else {
            appendRow(nextRowData); // Append the next row
        }
    } catch (error) {
        console.error("Error in resumeSimulation:", error);
    }
}

function appendRow(data) {
    // Get the table body
    const tableBody = document.querySelector("#playDataTable tbody");

    // Create a new row
    const row = document.createElement("tr");

    // Add table cells for each column
    const columns = [
        "game_date", "inning", "inning_topbot", "player_name",
        "events", "description", "pitch_type", // Include pitch_type for predictions
        "outs_when_up", "balls", "strikes", "bat_score", "fld_score"
    ];
    columns.forEach(column => {
        const cell = document.createElement("td");
        cell.textContent = data[column] !== null ? data[column] : "N/A"; // Handle null values
        row.appendChild(cell);
    });

    // Append the row to the table
    tableBody.appendChild(row);

    // Update currentRow to track the most recent row
    currentRow = row;
}
