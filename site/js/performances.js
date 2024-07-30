function searchPerformances() {
    const searchValue = document.getElementById('search').value.toLowerCase();
    const rows = document.querySelectorAll('#performances-table tbody tr');
    rows.forEach(row => {
        const playTitle = row.querySelector('td:nth-child(5)').textContent.toLowerCase();
        if (searchValue === '' || playTitle.includes(searchValue)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    fetch('http://127.0.0.1:3000/performances')
        .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
        .then(data => {
            const tableBody = document.querySelector('#performances-table tbody');
            data.forEach(performance => {
                const row = `
                    <tr>
                        <td>${performance.PerformanceID}</td>
                        <td>${performance.Date}</td>
                        <td>${performance.StartTime}</td>
                        <td>${performance.EndTime}</td>
                        <td>${performance.PlayTitle}</td>
                        <td>${performance.TheaterName}</td>
                    </tr>
                `;
                tableBody.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});