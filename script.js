// GAA Match Scheduler JavaScript
class GAAMatchScheduler {
    constructor() {
        this.matches = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadMatches();
        this.setupEventListeners();
        this.renderMatches();
    }

    setupEventListeners() {
        // Add match form
        const addMatchForm = document.getElementById('addMatchForm');
        if (addMatchForm) {
            addMatchForm.addEventListener('submit', (e) => this.handleAddMatch(e));
        }

        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderMatches();
            });
        }

        // Clear all button
        const clearAllBtn = document.getElementById('clearAllBtn');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.clearAllMatches());
        }

        // Modal close button
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeEditModal());
        }

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('editModal');
            if (e.target === modal) {
                this.closeEditModal();
            }
        });

        // Edit match form
        const editMatchForm = document.getElementById('editMatchForm');
        if (editMatchForm) {
            editMatchForm.addEventListener('submit', (e) => this.handleEditMatch(e));
        }
    }

    handleAddMatch(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const match = {
            id: Date.now().toString(),
            date: formData.get('matchDate') || document.getElementById('matchDate').value,
            time: formData.get('matchTime') || document.getElementById('matchTime').value,
            gameType: formData.get('gameType') || document.getElementById('gameType').value,
            matchDuration: formData.get('matchDuration') || document.getElementById('matchDuration').value,
            intervalDuration: formData.get('intervalDuration') || document.getElementById('intervalDuration').value,
            status: formData.get('matchStatus') || document.getElementById('matchStatus').value,
            homeTeam: formData.get('homeTeam') || document.getElementById('homeTeam').value,
            awayTeam: formData.get('awayTeam') || document.getElementById('awayTeam').value,
            venue: formData.get('venue') || document.getElementById('venue').value,
            competition: formData.get('competition') || document.getElementById('competition').value,
            ageGroup: formData.get('ageGroup') || document.getElementById('ageGroup').value,
            notes: formData.get('notes') || document.getElementById('notes').value,
            createdAt: new Date().toISOString()
        };

        this.matches.push(match);
        this.saveMatches();
        this.renderMatches();
        e.target.reset();
        
        // Show success message
        this.showNotification('Match added successfully!', 'success');
    }

    handleEditMatch(e) {
        e.preventDefault();
        
        const matchId = document.getElementById('editMatchId').value;
        const matchIndex = this.matches.findIndex(m => m.id === matchId);
        
        if (matchIndex !== -1) {
            this.matches[matchIndex] = {
                ...this.matches[matchIndex],
                date: document.getElementById('editMatchDate').value,
                time: document.getElementById('editMatchTime').value,
                gameType: document.getElementById('editGameType').value,
                matchDuration: document.getElementById('editMatchDuration').value,
                intervalDuration: document.getElementById('editIntervalDuration').value,
                status: document.getElementById('editMatchStatus').value,
                homeTeam: document.getElementById('editHomeTeam').value,
                awayTeam: document.getElementById('editAwayTeam').value,
                venue: document.getElementById('editVenue').value,
                competition: document.getElementById('editCompetition').value,
                ageGroup: document.getElementById('editAgeGroup').value,
                notes: document.getElementById('editNotes').value,
                updatedAt: new Date().toISOString()
            };

            this.saveMatches();
            this.renderMatches();
            this.closeEditModal();
            
            this.showNotification('Match updated successfully!', 'success');
        }
    }

    editMatch(matchId) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match) return;

        // Populate edit form
        document.getElementById('editMatchId').value = match.id;
        document.getElementById('editMatchDate').value = match.date;
        document.getElementById('editMatchTime').value = match.time;
        document.getElementById('editGameType').value = match.gameType;
        document.getElementById('editMatchDuration').value = match.matchDuration;
        document.getElementById('editIntervalDuration').value = match.intervalDuration;
        document.getElementById('editMatchStatus').value = match.status;
        document.getElementById('editHomeTeam').value = match.homeTeam;
        document.getElementById('editAwayTeam').value = match.awayTeam;
        document.getElementById('editVenue').value = match.venue;
        document.getElementById('editCompetition').value = match.competition || '';
        document.getElementById('editAgeGroup').value = match.ageGroup;
        document.getElementById('editNotes').value = match.notes || '';

        // Show modal
        document.getElementById('editModal').style.display = 'block';
    }

    closeEditModal() {
        document.getElementById('editModal').style.display = 'none';
    }

    deleteMatch(matchId) {
        if (confirm('Are you sure you want to delete this match?')) {
            this.matches = this.matches.filter(m => m.id !== matchId);
            this.saveMatches();
            this.renderMatches();
            this.showNotification('Match deleted successfully!', 'success');
        }
    }

    toggleMatchStatus(matchId) {
        const match = this.matches.find(m => m.id === matchId);
        if (!match) return;

        if (match.status === 'scheduled') {
            match.status = 'completed';
        } else if (match.status === 'completed') {
            match.status = 'scheduled';
        }

        this.saveMatches();
        this.renderMatches();
        this.showNotification(`Match marked as ${match.status}!`, 'success');
    }

    addToGoogleCalendar(match) {
        const startDateTime = new Date(`${match.date}T${match.time}`);
        const halfDuration = parseInt(match.matchDuration);
        const intervalDuration = parseInt(match.intervalDuration);
        
        // Calculate end time (2 halves + interval)
        const totalDuration = (halfDuration * 2) + intervalDuration;
        const endDateTime = new Date(startDateTime.getTime() + (totalDuration * 60 * 1000));
        
        // Format dates for Google Calendar
        const formatDate = (date) => {
            return date.toISOString().replace(/-|:|\.\d+/g, '');
        };

        const eventTitle = `${match.homeTeam} vs ${match.awayTeam} - ${match.gameType}`;
        const eventDetails = `${match.competition ? match.competition + ' - ' : ''}${match.ageGroup}
Venue: ${match.venue}
Half Duration: ${match.matchDuration} minutes
Interval: ${match.intervalDuration} minutes
${match.notes ? 'Notes: ' + match.notes : ''}`;

        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${formatDate(startDateTime)}/${formatDate(endDateTime)}&details=${encodeURIComponent(eventDetails)}&location=${encodeURIComponent(match.venue)}`;

        window.open(googleCalendarUrl, '_blank');
    }

    renderMatches() {
        const matchesList = document.getElementById('matchesList');
        if (!matchesList) return;

        let filteredMatches = this.matches;
        if (this.currentFilter !== 'all') {
            filteredMatches = this.matches.filter(m => m.status === this.currentFilter);
        }

        // Sort matches by date and time (earliest first)
        filteredMatches.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        if (filteredMatches.length === 0) {
            matchesList.innerHTML = '';
            return;
        }

        matchesList.innerHTML = filteredMatches.map(match => this.createMatchCard(match)).join('');
    }

    createMatchCard(match) {
        const startDateTime = new Date(`${match.date}T${match.time}`);
        const halfDuration = parseInt(match.matchDuration);
        const intervalDuration = parseInt(match.intervalDuration);
        const totalDuration = (halfDuration * 2) + intervalDuration;
        
        // Calculate end time
        const endDateTime = new Date(startDateTime.getTime() + (totalDuration * 60 * 1000));
        const endTime = endDateTime.toLocaleTimeString('en-IE', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });

        const formattedDate = startDateTime.toLocaleDateString('en-IE', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = startDateTime.toLocaleTimeString('en-IE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        return `
            <div class="match-card ${match.status}">
                <div class="match-header">
                    <div class="match-title">${match.homeTeam} vs ${match.awayTeam}</div>
                    <span class="match-status ${match.status}">${match.status}</span>
                </div>
                
                <div class="match-details">
                    <div class="match-detail">
                        <span class="match-detail-label">Date & Time</span>
                        <span class="match-detail-value">${formattedDate} at ${formattedTime}</span>
                    </div>
                    <div class="match-detail">
                        <span class="match-detail-label">End Time</span>
                        <span class="match-detail-value">${endTime}</span>
                    </div>
                    <div class="match-detail">
                        <span class="match-detail-label">Game Type</span>
                        <span class="match-detail-value">${match.gameType}</span>
                    </div>
                    <div class="match-detail">
                        <span class="match-detail-label">Age Group</span>
                        <span class="match-detail-value">${match.ageGroup}</span>
                    </div>
                    <div class="match-detail">
                        <span class="match-detail-label">Venue</span>
                        <span class="match-detail-value">${match.venue}</span>
                    </div>
                    <div class="match-detail">
                        <span class="match-detail-label">Duration</span>
                        <span class="match-detail-value">2 × ${match.matchDuration}min + ${match.intervalDuration}min interval</span>
                    </div>
                    ${match.competition ? `
                    <div class="match-detail">
                        <span class="match-detail-label">Competition</span>
                        <span class="match-detail-value">${match.competition}</span>
                    </div>
                    ` : ''}
                </div>
                
                ${match.notes ? `
                <div class="match-notes">
                    <div class="match-notes-label">Notes</div>
                    <div class="match-notes-text">${match.notes}</div>
                </div>
                ` : ''}
                
                <div class="match-actions">
                    <button class="btn btn-primary" onclick="scheduler.addToGoogleCalendar(${JSON.stringify(match).replace(/"/g, '&quot;')})">
                        📅 Add to Calendar
                    </button>
                    <button class="btn btn-secondary" onclick="scheduler.editMatch('${match.id}')">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-success" onclick="scheduler.toggleMatchStatus('${match.id}')">
                        ${match.status === 'completed' ? '🔄 Mark as Scheduled' : '✅ Mark as Completed'}
                    </button>
                    <button class="btn btn-danger" onclick="scheduler.deleteMatch('${match.id}')">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }

    saveMatches() {
        localStorage.setItem('gaaMatches', JSON.stringify(this.matches));
    }

    loadMatches() {
        const saved = localStorage.getItem('gaaMatches');
        this.matches = saved ? JSON.parse(saved) : [];
    }

    clearAllMatches() {
        if (confirm('Are you sure you want to delete ALL matches? This cannot be undone.')) {
            this.matches = [];
            this.saveMatches();
            this.renderMatches();
            this.showNotification('All matches cleared!', 'success');
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// Initialize the scheduler when the page loads
let scheduler;
document.addEventListener('DOMContentLoaded', () => {
    scheduler = new GAAMatchScheduler();
});

// Make scheduler globally accessible for onclick handlers
window.scheduler = scheduler;
