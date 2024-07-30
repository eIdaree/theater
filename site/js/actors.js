function updateActorInfo(actorId) {
    const age = prompt('Enter new age:');
    const nationality = prompt('Enter new nationality:');

    fetch(`http://127.0.0.1:3000/actors/${actorId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ age, nationality })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update actor information');
            }
            alert('Actor information updated successfully');
            location.reload(); // Reload the page to reflect changes
        })
        .catch(error => {
            console.error('Error updating actor information:', error);
        });
}

document.addEventListener('DOMContentLoaded', function () {
    const filterButton = document.getElementById('filterButton');
    const maleFilter = document.getElementById('maleFilter');
    const femaleFilter = document.getElementById('femaleFilter');
    const playTitleFilters = document.getElementById('playTitleFilters');
    const chooseTitlesButton = document.getElementById('chooseTitlesButton');

    let isAdmin = false;

    fetch('http://127.0.0.1:3000/checkAuthStatus', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            isAdmin = data.status === 'Admin'; 
        })
        .catch(error => {
            console.error('Error checking authentication status:', error);
        });

    chooseTitlesButton.addEventListener('click', function () {
        fetch('http://127.0.0.1:3000/playtitles')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                playTitleFilters.innerHTML = ''; // Clear existing checkboxes
                data.forEach(playTitle => {
                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    input.id = `play${playTitle.PlayTitle.replace(/\s/g, '')}Filter`;
                    input.name = 'playTitleFilter';
                    input.value = playTitle.PlayTitle;
                    const label = document.createElement('label');
                    label.htmlFor = `play${playTitle.PlayTitle.replace(/\s/g, '')}Filter`;
                    label.textContent = playTitle.PlayTitle;

                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.classList.add('grid-item');
                    checkboxDiv.appendChild(input);
                    checkboxDiv.appendChild(label);

                    playTitleFilters.appendChild(checkboxDiv);
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });

    filterButton.addEventListener('click', function () {
        const filters = {
            gender: [],
            playTitles: []
        };

        if (maleFilter.checked) {
            filters.gender.push('Male');
        }
        if (femaleFilter.checked) {
            filters.gender.push('Female');
        }

        const playTitleCheckboxes = playTitleFilters.querySelectorAll('input[type="checkbox"]');
        playTitleCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                filters.playTitles.push(checkbox.value);
            }
        });

        fetch('http://127.0.0.1:3000/actors')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                
                

                const filteredData = data.filter(actor => {
                    return (filters.gender.length === 0 || filters.gender.includes(actor.Gender)) &&
                        (filters.playTitles.length === 0 || filters.playTitles.includes(actor.PlayTitle));
                });

                const tableContainer = document.getElementById('actors-table-container');
                tableContainer.innerHTML = ''; // Clear existing table
                const table = document.createElement('table');
                table.id = 'actors-table';
                table.border = '1';
                table.innerHTML = `
                    <thead>
                        <tr>
                            <th>Actor ID</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Gender</th>
                            <th>Nationality</th>
                            <th>Date</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Play Title</th>
                            <th>Theater Name</th>
                            <th>Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredData.map(actor => `
                            <tr>
                                <td>${actor.ActorID}</td>
                                <td>${actor.ActorName}</td>
                                <td>${actor.Age}</td>
                                <td>${actor.Gender}</td>
                                <td>${actor.Nationality}</td>
                                <td>${actor.Date}</td>
                                <td>${actor.StartTime}</td>
                                <td>${actor.EndTime}</td>
                                <td>${actor.PlayTitle}</td>
                                <td>${actor.TheaterName}</td>
                                <td>${isAdmin ? `<button onclick="updateActorInfo(${actor.ActorID})">Update</button>` : 'Not Admin'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                `;
                tableContainer.appendChild(table);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });

    filterButton.click(); // Initially load all actors
});