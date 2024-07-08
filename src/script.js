async function fetchCalendarData() {
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching calendar data:', error);
    }
}

function createCalendar(data) {
    const calendarContainer = document.getElementById('calendar-container');
    calendarContainer.innerHTML = '';

    data.forEach(yearData => {
        yearData.months.forEach(monthData => {
            const monthDiv = document.createElement('div');
            monthDiv.classList.add('month');

            const monthName = new Date(yearData.year, monthData.month - 1).toLocaleString('default', { month: 'long' });
            monthDiv.innerHTML = `<h2>${monthName} ${yearData.year}</h2>`;

            monthData.days.forEach(dayData => {
                const dayDiv = document.createElement('div');
                dayDiv.classList.add('day');
                if (dayData.isHoliday) dayDiv.classList.add('holiday');
                
                dayDiv.innerHTML = `
                    <div>${dayData.dayInEn} (${dayData.day})</div>
                    <div class="event">${dayData.event}</div>
                    <div>${dayData.tithi}</div>
                `;
                monthDiv.appendChild(dayDiv);
            });

            calendarContainer.appendChild(monthDiv);
        });
    });
}

async function init() {
    const calendarData = await fetchCalendarData();
    if (calendarData) {
        createCalendar(calendarData);
    } else {
        console.error('No calendar data available.');
    }
}

document.addEventListener('DOMContentLoaded', init);
