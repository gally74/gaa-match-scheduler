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

        // Export year report button
        const exportYearBtn = document.getElementById('exportYearBtn');
        if (exportYearBtn) {
            exportYearBtn.addEventListener('click', () => this.exportYearReport());
        }

        // Select All / Deselect All buttons
        const selectAllBtn = document.getElementById('selectAllBtn');
        const deselectAllBtn = document.getElementById('deselectAllBtn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.selectAllGameTypes());
        }
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => this.deselectAllGameTypes());
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

        // Score input event listeners for real-time calculation
        this.setupScoreEventListeners();
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
            // Score fields
            homeTeamGoals: 0,
            homeTeamPoints: 0,
            awayTeamGoals: 0,
            awayTeamPoints: 0,
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
                // Update score fields
                homeTeamGoals: parseInt(document.getElementById('editHomeTeamGoals').value) || 0,
                homeTeamPoints: parseInt(document.getElementById('editHomeTeamPoints').value) || 0,
                awayTeamGoals: parseInt(document.getElementById('editAwayTeamGoals').value) || 0,
                awayTeamPoints: parseInt(document.getElementById('editAwayTeamPoints').value) || 0,
                updatedAt: new Date().toISOString()
            };

            // Auto-change status to "played" if scores are added
            const hasScores = (parseInt(document.getElementById('editHomeTeamGoals').value) || 0) > 0 || 
                             (parseInt(document.getElementById('editHomeTeamPoints').value) || 0) > 0 ||
                             (parseInt(document.getElementById('editAwayTeamGoals').value) || 0) > 0 ||
                             (parseInt(document.getElementById('editAwayTeamPoints').value) || 0) > 0;
            
            if (hasScores && this.matches[matchIndex].status === 'scheduled') {
                this.matches[matchIndex].status = 'completed';
                this.showNotification('Match status automatically changed to "completed" due to scores being added!', 'info');
            }

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

        // Populate score fields
        document.getElementById('editHomeTeamGoals').value = match.homeTeamGoals || 0;
        document.getElementById('editHomeTeamPoints').value = match.homeTeamPoints || 0;
        document.getElementById('editAwayTeamGoals').value = match.awayTeamGoals || 0;
        document.getElementById('editAwayTeamPoints').value = match.awayTeamPoints || 0;

        // Calculate and display totals
        this.calculateTotalScores();

        // Update score input labels with team names
        this.updateScoreLabels(match.homeTeam, match.awayTeam);

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
        let eventDetails = `${match.competition ? match.competition + ' - ' : ''}${match.ageGroup}
Venue: ${match.venue}
Half Duration: ${match.matchDuration} minutes
Interval: ${match.intervalDuration} minutes
${match.notes ? 'Notes: ' + match.notes : ''}`;

        // Add scores if they exist
        const { homeTotal, awayTotal } = this.calculateMatchScore(match);
        if (homeTotal > 0 || awayTotal > 0) {
            eventDetails += `

Final Score:
${match.homeTeam}: ${homeTotal} points (${match.homeTeamGoals || 0} goals, ${match.homeTeamPoints || 0} points)
${match.awayTeam}: ${awayTotal} points (${match.awayTeamGoals || 0} goals, ${match.awayTeamPoints || 0} points)`;
        }

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
                
                ${this.renderMatchScores(match)}
                
                <div class="match-actions">
                    <button class="btn btn-primary" onclick="scheduler.addToGoogleCalendar(${JSON.stringify(match).replace(/"/g, '&quot;')})">
                        📅 Add to Calendar
                    </button>
                    <button class="btn btn-secondary" onclick="scheduler.editMatch('${match.id}')">
                        ✏️ Edit
                    </button>
                    ${match.status === 'scheduled' ? `
                    <button class="btn btn-info" onclick="scheduler.editMatch('${match.id}')">
                        📊 Add Scores
                    </button>
                    ` : ''}
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

    setupScoreEventListeners() {
        // Add event listeners for score inputs to calculate totals in real-time
        const scoreInputs = ['editHomeTeamGoals', 'editHomeTeamPoints', 'editAwayTeamGoals', 'editAwayTeamPoints'];
        scoreInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.calculateTotalScores());
            }
        });
    }

    calculateTotalScores() {
        const homeGoals = parseInt(document.getElementById('editHomeTeamGoals')?.value || 0);
        const homePoints = parseInt(document.getElementById('editHomeTeamPoints')?.value || 0);
        const awayGoals = parseInt(document.getElementById('editAwayTeamGoals')?.value || 0);
        const awayPoints = parseInt(document.getElementById('editAwayTeamPoints')?.value || 0);

        // Calculate totals (1 goal = 3 points)
        const homeTotal = (homeGoals * 3) + homePoints;
        const awayTotal = (awayGoals * 3) + awayPoints;

        // Update total displays
        const homeTotalElement = document.getElementById('editHomeTeamTotal');
        const awayTotalElement = document.getElementById('editAwayTeamTotal');
        
        if (homeTotalElement) homeTotalElement.textContent = homeTotal;
        if (awayTotalElement) awayTotalElement.textContent = awayTotal;
    }

    calculateMatchScore(match) {
        const homeTotal = (parseInt(match.homeTeamGoals || 0) * 3) + parseInt(match.homeTeamPoints || 0);
        const awayTotal = (parseInt(match.awayTeamGoals || 0) * 3) + parseInt(match.awayTeamPoints || 0);
        return { homeTotal, awayTotal };
    }

    updateScoreLabels(homeTeam, awayTeam) {
        // Update the score input labels to show actual team names
        const homeGoalsLabel = document.querySelector('label[for="editHomeTeamGoals"]');
        const homePointsLabel = document.querySelector('label[for="editHomeTeamPoints"]');
        const awayGoalsLabel = document.querySelector('label[for="editAwayTeamGoals"]');
        const awayPointsLabel = document.querySelector('label[for="editAwayTeamPoints"]');
        
        if (homeGoalsLabel) homeGoalsLabel.textContent = `${homeTeam} Goals`;
        if (homePointsLabel) homePointsLabel.textContent = `${homeTeam} Points`;
        if (awayGoalsLabel) awayGoalsLabel.textContent = `${awayTeam} Goals`;
        if (awayPointsLabel) awayPointsLabel.textContent = `${awayTeam} Points`;

        // Update total score labels
        const homeTotalLabel = document.querySelector('#editHomeTeamTotal').previousElementSibling;
        const awayTotalLabel = document.querySelector('#editAwayTeamTotal').previousElementSibling;
        
        if (homeTotalLabel) homeTotalLabel.textContent = `${homeTeam} Total:`;
        if (awayTotalLabel) awayTotalLabel.textContent = `${awayTeam} Total:`;
    }

    renderMatchScores(match) {
        const { homeTotal, awayTotal } = this.calculateMatchScore(match);
        
        // Only show scores if they exist
        if (homeTotal === 0 && awayTotal === 0) {
            return '';
        }

        return `
            <div class="match-scores">
                <div class="score-row">
                    <div class="team-score-display">
                        <span class="team-name">${match.homeTeam}</span>
                        <div class="goals-points">
                            <span class="goal-count">${match.homeTeamGoals || 0} Goals</span>
                            <span class="point-count">${match.homeTeamPoints || 0} Points</span>
                        </div>
                    </div>
                    <span class="total-score-display">${homeTotal}</span>
                </div>
                <div class="score-row">
                    <div class="team-score-display">
                        <span class="team-name">${match.awayTeam}</span>
                        <div class="goals-points">
                            <span class="goal-count">${match.awayTeamGoals || 0} Goals</span>
                            <span class="point-count">${match.awayTeamPoints || 0} Points</span>
                        </div>
                    </div>
                    <span class="total-score-display">${awayTotal}</span>
                </div>
            </div>
        `;
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

    selectAllGameTypes() {
        const checkboxes = document.querySelectorAll('.game-type-checkboxes input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        this.showNotification('All game types selected', 'info');
    }

    deselectAllGameTypes() {
        const checkboxes = document.querySelectorAll('.game-type-checkboxes input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.showNotification('All game types deselected', 'info');
    }

    getSelectedGameTypes() {
        const checkboxes = document.querySelectorAll('.game-type-checkboxes input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    exportYearReport() {
        const currentYear = new Date().getFullYear();
        const selectedGameTypes = this.getSelectedGameTypes();
        
        if (selectedGameTypes.length === 0) {
            this.showNotification('Please select at least one game type to export', 'warning');
            return;
        }

        let yearMatches = this.matches.filter(match => {
            const matchYear = new Date(match.date).getFullYear();
            return matchYear === currentYear;
        });

        // Filter by selected game types
        yearMatches = yearMatches.filter(match => 
            selectedGameTypes.includes(match.gameType)
        );

        if (yearMatches.length === 0) {
            this.showNotification(`No ${selectedGameTypes.join(', ')} matches found for ${currentYear}`, 'info');
            return;
        }

        // Sort matches by date
        yearMatches.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Create report content
        let reportContent = `GAA Referee Report - ${currentYear}\n`;
        reportContent += `Generated on: ${new Date().toLocaleDateString('en-IE')}\n`;
        reportContent += `Game Types: ${selectedGameTypes.join(', ')}\n`;
        reportContent += `Total Matches: ${yearMatches.length}\n\n`;

        // Group by game type
        const gameTypeStats = {};
        yearMatches.forEach(match => {
            if (!gameTypeStats[match.gameType]) {
                gameTypeStats[match.gameType] = 0;
            }
            gameTypeStats[match.gameType]++;
        });

        reportContent += `Game Type Breakdown:\n`;
        Object.entries(gameTypeStats).forEach(([gameType, count]) => {
            reportContent += `  ${gameType}: ${count} matches\n`;
        });

        reportContent += `\nMatch Details:\n`;
        reportContent += `==========================================\n\n`;

        yearMatches.forEach((match, index) => {
            const matchDate = new Date(match.date).toLocaleDateString('en-IE');
            const totalDuration = (parseInt(match.matchDuration) * 2) + parseInt(match.intervalDuration);
            
            reportContent += `Match ${index + 1}: ${matchDate} at ${match.time}\n`;
            reportContent += `   ${match.homeTeam} vs ${match.awayTeam}\n`;
            reportContent += `   ${match.gameType} - ${match.ageGroup}\n`;
            reportContent += `   Venue: ${match.venue}\n`;
            reportContent += `   Duration: 2 × ${match.matchDuration}min + ${match.intervalDuration}min interval (Total: ${totalDuration}min)\n`;
            if (match.competition) {
                reportContent += `   Competition: ${match.competition}\n`;
            }
            if (match.notes) {
                reportContent += `   Notes: ${match.notes}\n`;
            }
            
            // Add scores if they exist
            const { homeTotal, awayTotal } = this.calculateMatchScore(match);
            if (homeTotal > 0 || awayTotal > 0) {
                reportContent += `   Final Score:\n`;
                reportContent += `     ${match.homeTeam}: ${homeTotal} points (${match.homeTeamGoals || 0} goals, ${match.homeTeamPoints || 0} points)\n`;
                reportContent += `     ${match.awayTeam}: ${awayTotal} points (${match.awayTeamGoals || 0} goals, ${match.awayTeamPoints || 0} points)\n`;
            }
            
            reportContent += `   Status: ${match.status.charAt(0).toUpperCase() + match.status.slice(1)}\n`;
            reportContent += `\n`;
        });

        // Add summary totals at the end
        reportContent += `==========================================\n`;
        reportContent += `SUMMARY TOTALS:\n`;
        reportContent += `==========================================\n`;
        Object.entries(gameTypeStats).forEach(([gameType, count]) => {
            reportContent += `Total ${gameType}: ${count} matches\n`;
        });
        reportContent += `\nGrand Total: ${yearMatches.length} matches\n`;

        // Create and download the file
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GAA_Referee_Report_${currentYear}_${selectedGameTypes.join('_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification(`Year report exported! ${yearMatches.length} ${selectedGameTypes.join(', ')} matches included.`, 'success');
    }
}

// Initialize the scheduler when the page loads
let scheduler;
document.addEventListener('DOMContentLoaded', () => {
    scheduler = new GAAMatchScheduler();
});

// Make scheduler globally accessible for onclick handlers
window.scheduler = scheduler;
