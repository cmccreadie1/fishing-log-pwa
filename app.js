        // --- Global Variables ---
        const fishCategories = {
            "Flatfish": [ "Brill", "Dab", "Flounder", "Halibut", "Megrim", "Plaice", "Sole (Dover)", "Sole (Lemon)", "Turbot" ],
            "Round Fish": [ "Bass", "Bream (Black)", "Bream (Gilthead)", "Bream (Red)", "Bream (Sea)", "Coalfish", "Cod", "Conger Eel", "Dogfish", "Dogfish (Black Mouth)", "Gurnard (Red)", "Gurnard (Tub)", "Haddock", "Hake", "John Dory", "Ling", "Mackerel", "Monkfish", "Mullet (Grey)", "Mullet (Red)", "Pollack", "Poor Cod", "Pouting", "Saithe", "Smoothhound", "Triggerfish", "Whiting" ],
            "Rays and Skates": [ "Ray (Blonde)", "Ray (Small-eyed)", "Ray (Starry)", "Ray (Thornback)", "Skate" ],
            "Sharks": [ "Shark (Blue)", "Shark (Porbeagle)", "Shark (Thresher)", "Smoothhound (Starry)", "Spurdog", "Tope" ],
            "Wrasse": [ "Wrasse (Ballan)", "Wrasse (Cuckoo)" ]
        };
        let fishData = [];
        let currentAngler = null;
        let currentDate = null;
        let currentVenue = null;
        let currentZone = null;
        let currentPeg = null;
        let currentPage = 'splashScreen';
        let isAppActive = false;
        let historyHijacked = false;
        let notesModalInstance = null;
        // No separate verifier modal instance needed

        // --- Utility Functions ---
        function formatDate(dateString) { if (!dateString) return 'N/A'; try { const d = new Date(dateString + 'T00:00:00Z'); return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); } catch (e) { console.error("Date format err:", e); return dateString; } }
        function showPage(pageId) { console.log("Show page:", pageId); document.querySelectorAll('.page').forEach(p => p.style.display = 'none'); const target = document.getElementById(pageId); if (target) { target.style.display = pageId === 'splashScreen' ? 'flex' : 'block'; currentPage = pageId; const container = document.querySelector('.container'); if(container) container.style.display = (pageId === 'splashScreen') ? 'none' : 'block'; if(pageId !== 'splashScreen' && !isAppActive) { activateAppMode(); } else if (pageId === 'splashScreen' && isAppActive) { deactivateAppMode(); } if (pageId !== 'splashScreen') { saveTempSession(); } } else { console.error("Page missing:", pageId, ". Defaulting splash."); const splash = document.getElementById('splashScreen'), container = document.querySelector('.container'); if(splash) splash.style.display = 'flex'; if(container) container.style.display = 'none'; currentPage = 'splashScreen'; deactivateAppMode(); } }

        // --- History/Navigation Control ---
        function activateAppMode() { if (!isAppActive) { console.log("Activating App Mode"); isAppActive = true; if (!historyHijacked) { history.pushState({ appActive: true }, '', location.href); historyHijacked = true; console.log("Pushed history state."); } } }
        function deactivateAppMode() { if (isAppActive) { console.log("Deactivating App Mode."); isAppActive = false; historyHijacked = false; } }
        function handleBackButton(event) { if (isAppActive) { console.log("popstate intercepted."); history.pushState({ appActive: true }, '', location.href); } else { console.log("popstate allowed."); } }
        function handleBeforeUnload(event) { if (isAppActive) { console.log("beforeunload prompt."); event.preventDefault(); event.returnValue = ''; return ''; } else { console.log("beforeunload allowed."); } }

        // --- Session Management ---
        function saveTempSession() { if (!currentAngler && !currentDate && !currentVenue && fishData.length === 0 && currentPage === 'registrationPage') return; const temp = { fishData: fishData||[], currentAngler, currentDate, currentVenue, currentZone, currentPeg, currentPage, isAppActive, historyHijacked }; try { localStorage.setItem('temp_session', JSON.stringify(temp)); } catch (e) { console.error("Save temp err:", e); } }
        function clearTempSession() { try { localStorage.removeItem('temp_session'); console.log("Temp cleared."); } catch (e) { console.error("Clear temp err:", e); } }
        function checkRestoreSession() { let data; try { const temp = localStorage.getItem('temp_session'); if (!temp) { showPage('splashScreen'); return; } data = JSON.parse(temp); if (!data || !Array.isArray(data.fishData)) throw new Error("Invalid format."); } catch (e) { console.error("Read temp err:", e); clearTempSession(); showPage('splashScreen'); return; } if (data.currentAngler || data.currentDate || data.currentVenue || data.fishData.length > 0) { console.log("Found session, show modal."); document.getElementById('restoreAngler').textContent=data.currentAngler||'N/A'; document.getElementById('restoreDate').textContent=data.currentDate?formatDate(data.currentDate):'N/A'; document.getElementById('restoreFishCount').textContent=data.fishData.length; const modalEl=document.getElementById('restoreSessionModal'); if(modalEl){let mI=bootstrap.Modal.getInstance(modalEl);if(!mI)mI=new bootstrap.Modal(modalEl,{backdrop:'static',keyboard:false}); mI.show();}else{console.error("Restore modal missing.");clearTempSession();showPage('splashScreen');} } else { clearTempSession(); showPage('splashScreen'); } }
        function restoreSession() { console.log("Restore clicked."); let temp; try { const sS=localStorage.getItem('temp_session'); if(!sS)throw new Error("No data."); temp=JSON.parse(sS); if(!temp||!Array.isArray(temp.fishData))throw new Error("Invalid format."); } catch(e){console.error("Restore err:",e);alert("Failed restore.");startNewSession();return;} fishData=temp.fishData||[]; currentAngler=temp.currentAngler||null; currentDate=temp.currentDate||null; currentVenue=temp.currentVenue||null; currentZone=temp.currentZone||null; currentPeg=temp.currentPeg||null; const page=temp.currentPage||'registrationPage'; isAppActive=temp.isAppActive||false; historyHijacked=temp.historyHijacked||false; console.log("Restoring to:",page,"App active:",isAppActive); try{if(currentAngler)document.getElementById('anglerName').value=currentAngler; if(currentDate)document.getElementById('competitionDate').value=currentDate; if(currentVenue)document.getElementById('venueInput').value=currentVenue; const isComp=!!(currentZone||currentPeg); document.getElementById('isCompetition').checked=isComp; toggleCompetitionFields(); if(currentZone)document.getElementById('zoneInput').value=currentZone; if(currentPeg)document.getElementById('pegInput').value=currentPeg;}catch(e){console.error("Restore reg fields err:",e);} if(page==='fishingPage'||page==='tallyPage'){populateSpeciesDropdown(); if(page==='fishingPage'){updateFishLog();}else if(page==='tallyPage'){populateTallySummaryFields();populateTallyTable();}} hideModal('restoreSessionModal'); showPage(page); if(isAppActive && !historyHijacked){history.pushState({appActive:true},'',location.href); historyHijacked=true; console.log("Pushed history after restore.");} console.log("Session restored."); }
        function startNewSession() { console.log("Start New."); clearTempSession(); resetApp(); hideModal('restoreSessionModal'); showPage('splashScreen'); }

        // --- UI Interaction ---
        function populateSpeciesDropdown() { const input=document.getElementById('speciesInput'); if(!input) {console.error("Species dropdown missing!"); return;} const cats=Object.keys(fishCategories).sort(); input.innerHTML='<option value="" selected disabled>Select species</option><option value="Other">Other</option>'; cats.forEach(cat=>{const group=document.createElement('optgroup'); group.label=cat; const species=[...fishCategories[cat]].sort(); species.forEach(s=>{const opt=document.createElement('option'); opt.value=s; opt.textContent=s; group.appendChild(opt);}); input.appendChild(group);}); console.log("Species dropdown populated."); }
        function toggleCustomSpeciesInput() { const sel=document.getElementById('speciesInput'), custom=document.getElementById('customSpeciesInput'); if(!sel||!custom)return; custom.style.display=sel.value==='Other'?'block':'none'; if(sel.value!=='Other')custom.value=''; }
        function toggleCompetitionFields() { try{const check=document.getElementById('isCompetition').checked, zone=document.getElementById('zoneInput'), peg=document.getElementById('pegInput'); zone.disabled=!check; peg.disabled=!check; if(!check){zone.value='';peg.value='';currentZone=null;currentPeg=null;}}catch(e){console.error("Toggle comp fields err:",e);} }
        function startApp() { console.log("Start Fishing."); populateSpeciesDropdown(); showPage('registrationPage'); }
        function startRecording() { console.log("Record Catch."); const nameEl=document.getElementById('anglerName'), dateEl=document.getElementById('competitionDate'), venueEl=document.getElementById('venueInput'), checkEl=document.getElementById('isCompetition'), zoneEl=document.getElementById('zoneInput'), pegEl=document.getElementById('pegInput'); if(!nameEl||!dateEl||!venueEl||!checkEl||!zoneEl||!pegEl){alert("Form elements missing.");return;} const name=nameEl.value.trim(), date=dateEl.value, venue=venueEl.value.trim(), isComp=checkEl.checked, zone=zoneEl.value, peg=pegEl.value; if(!name||!date||!venue){alert("Name, Date, Venue required.");return;} if(isComp&&(!zone||!peg)){alert("Zone & Peg required for competition.");return;} if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){alert("Valid date required.");return;} currentAngler=name; currentDate=date; currentVenue=venue; currentZone=isComp?zone:null; currentPeg=isComp?peg:null; const isActuallyCompetition = !!(currentZone && currentPeg); console.log("Start recording data:",{currentAngler,currentDate,currentVenue,currentZone,currentPeg,isCompetition:isActuallyCompetition}); saveTempSession(); updateFishLog(); showPage('fishingPage'); }
        function addFish() { console.log("Add Fish."); const spEl=document.getElementById('speciesInput'), custEl=document.getElementById('customSpeciesInput'), lenEl=document.getElementById('lengthInput'); if(!spEl||!custEl||!lenEl){alert("Add fish elements missing.");return;} let species=spEl.value; const lenVal=lenEl.value.trim(); let length; if(!lenVal){alert("Length required.");return;} length=Math.round(parseFloat(lenVal)); if(isNaN(length)||length<=0||length>500){alert("Valid length (1-500cm) required.");return;} if(species==='Other'){species=custEl.value.trim();if(!species){alert("Custom species name required.");return;}if(!/^[a-zA-Z\s'-]+$/.test(species)){alert("Invalid species chars.");return;}}else if(!species){alert("Select species.");return;} fishData.push({species,length});console.log("Added:",{species,length}); updateFishLog(); spEl.value='';custEl.value='';lenEl.value=''; toggleCustomSpeciesInput();saveTempSession(); }
        function updateFishLog() { const log=document.getElementById('fishLog'); if(!log)return; log.innerHTML=fishData.map((f,i)=>`<tr><td>${f.species||'?'}</td><td>${f.length||'?'}</td><td class="text-end"><button class="btn btn-danger btn-sm" onclick="deleteFish(${i})"><i class="bi bi-trash"></i></button></td></tr>`).join('');}
        function deleteFish(idx){if(idx>=0&&idx<fishData.length){const{species,length}=fishData[idx];if(confirm(`Delete ${species||'?'} (${length||'?'}cm)?`)){console.log("Deleting:",idx);fishData.splice(idx,1);updateFishLog();saveTempSession();}}else{console.error("Invalid delete idx:",idx);}}
        function backFromFishing() { console.log("Back from Fishing."); showPage('registrationPage'); }

        // *** UPDATED: Shows the single confirmation modal, adjusts visibility of verifier inside ***
        function showEndSessionModal() {
            console.log("End Session button clicked.");
            const modalEl = document.getElementById('endSessionModal');
            const verifierSection = document.getElementById('verifierEndModalSection');
            const verifierInput = document.getElementById('verifierEndModalInput');

            if (!modalEl || !verifierSection || !verifierInput) {
                console.error("End session modal or its verifier elements missing!");
                alert("Error preparing end session dialog.");
                return;
            }

            // Check competition status and show/hide verifier section within the modal
            const isCompetition = !!(currentZone && currentPeg);
            if (isCompetition) {
                console.log("Setting up modal for Competition save.");
                verifierSection.style.display = 'block';
                verifierInput.value = ''; // Clear previous input
            } else {
                console.log("Setting up modal for Non-Competition save.");
                verifierSection.style.display = 'none';
                verifierInput.value = ''; // Clear just in case
            }

            // Show the single modal
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl, {backdrop: 'static', keyboard: false});
            modalInstance.show();
        }

        // *** UPDATED: Handles single confirm button, includes conditional verifier check ***
        function confirmEndSession() {
            console.log("Confirm End button clicked.");

            // 1. Basic Data Validation (Globals)
            if (!currentAngler || !currentDate || !currentVenue) {
                alert("Cannot save session: Missing Angler Name, Date, or Venue information.");
                hideModal('endSessionModal'); // Hide modal before navigating
                showPage('registrationPage');
                return;
            }

            const isCompetition = !!(currentZone && currentPeg);
            let verifierName = null;

            // 2. Competition Verifier Validation (If applicable)
            if (isCompetition) {
                 const verifierInput = document.getElementById('verifierEndModalInput');
                 if (!verifierInput) {
                     console.error("Verifier input missing inside modal during save!");
                     alert("Error: Verifier field is missing. Cannot save competition scorecard.");
                     // Keep modal open if possible, maybe return? Bootstrap might close it.
                     return;
                 }
                 verifierName = verifierInput.value.trim();
                 if (!verifierName) {
                     alert("Competition Scorecard: Please enter the verifier's name in the modal.");
                     verifierInput.focus(); // Keep focus in modal
                     return; // Stop saving, keep modal open
                 }
            }

            // 3. Hide modal *before* attempting save (to prevent issues if save fails)
            hideModal('endSessionModal');

            // 4. Prepare and Save Data
            console.log("Validation passed. Proceeding to save data.");
            const sessionData = {
                currentAngler, currentDate, currentVenue, currentZone, currentPeg,
                verifier: verifierName, // Will be null if not competition or invalid
                notes: null, // Initialize notes field
                fishData: fishData || []
            };
            const id = `scorecard_${Date.now()}`;
            try {
                localStorage.setItem(id, JSON.stringify(sessionData));
                console.log("Saved:", id, sessionData);
                alert("Scorecard saved successfully!");
                clearTempSession();
                resetApp(); // This includes deactivateAppMode()
                showPage('splashScreen');
            } catch(e) {
                console.error("Save err:", e);
                alert("Save failed. Local storage might be full or disabled.");
                // On failure, ideally return user to fishing page to retry
                showPage('fishingPage');
            }
        }
        // Removed saveScorecardData function, logic merged into confirmEndSession

        // --- Tally Page ---
        function populateTallySummaryFields() { try{document.getElementById('summaryAngler').textContent=currentAngler||'?'; document.getElementById('summaryDate').textContent=currentDate?formatDate(currentDate):'?'; document.getElementById('summaryVenue').textContent=currentVenue||'?'; document.getElementById('summaryZone').textContent=currentZone||'?'; document.getElementById('summaryPeg').textContent=currentPeg||'?'; document.getElementById('summaryVerifier').innerHTML = '';}catch(e){} }
        function populateTallyTable() { const table=document.getElementById('tallyTable'); if (!table)return; const sum={}; let tL=0, lF=null; fishData.forEach(f=>{const sK=f.species||"?";const l=f.length||0; sum[sK]=sum[sK]||{c:0,tL:0,l:[]}; sum[sK].c++;sum[sK].tL+=l;sum[sK].l.push(l); tL+=l; if(!lF||l>(lF.length||0))lF=f;}); Object.values(sum).forEach(d=>d.l.sort((a,b)=>a-b)); const sorted=Object.entries(sum).sort(([a],[b])=>a.localeCompare(b)); table.innerHTML=sorted.map(([s,d])=>`<tr><td>${s}</td><td>${d.c}</td><td>(${d.l.join(', ')})</td><td>${d.tL}</td></tr>`).join('')||'<tr><td colspan="4" class="text-center">No fish.</td></tr>'; document.getElementById('tallyTotalLength').textContent=`${tL} cm`; document.getElementById('tallySpeciesCount').textContent=Object.keys(sum).length; document.getElementById('longestFishSpecies').textContent=lF?(lF.species||'?'):'N/A'; document.getElementById('longestFishLength').textContent=lF?`${lF.length||'?'} cm`:'0 cm';}
        function backFromTally() { console.log("Back from Tally."); showPage('fishingPage'); }

        // --- Saved Scorecards ---
        function showScorecardsModal() { console.log("View Scorecards."); const modalEl=document.getElementById('savedScorecardsModal'), listEl=document.getElementById('savedScorecardsList'); if(modalEl&&listEl){listEl.innerHTML='<div class="text-center p-3"><div class="spinner-border text-primary"><span class="visually-hidden">Load...</span></div></div>'; let mI=bootstrap.Modal.getInstance(modalEl);if(!mI)mI=new bootstrap.Modal(modalEl,{backdrop:'static',keyboard:false});mI.show();setTimeout(loadScorecards,50);}else{console.error("Scorecard modal/list missing.");alert("Err show modal.");}}

        function loadScorecards() {
            console.log("Loading scorecards...");
            const savedScorecardsList = document.getElementById('savedScorecardsList');
            const olderScorecardsToggleContainer = document.getElementById('olderScorecardsToggleContainer');
             if (!savedScorecardsList) { console.error("CRITICAL: savedScorecardsList element not found!"); const mb = document.getElementById('savedScorecardsModal')?.querySelector('.modal-body'); if(mb) mb.innerHTML = '<p class="text-danger">Error: List container missing.</p>'; return; }
             if (!olderScorecardsToggleContainer) { console.error("CRITICAL: olderScorecardsToggleContainer element not found!"); }

            savedScorecardsList.innerHTML = ''; if(olderScorecardsToggleContainer) olderScorecardsToggleContainer.innerHTML = '';
            const scorecards = []; let loadError = false;

            try { for (let i=0; i<localStorage.length; i++){ const key=localStorage.key(i); if (key?.startsWith('scorecard_')){ const dS=localStorage.getItem(key); if(dS){ try { const data=JSON.parse(dS); if(data?.currentAngler && data.currentDate && data.currentVenue){ const tS=parseInt(key.split('_')[1],10); if(!isNaN(tS)){scorecards.push({key,data,timestamp:tS});}} else {console.warn("Skip invalid card:",key);}} catch(e){console.error("Parse err:",key,e);}}}}}
            catch (e) { console.error("LS err:",e); savedScorecardsList.innerHTML='<p class="text-danger p-3">Load failed.</p>'; loadError=true; }
            if(loadError) return;

            scorecards.sort((a,b)=>b.timestamp-a.timestamp);
            if (scorecards.length===0){ savedScorecardsList.innerHTML='<p class="text-center p-3">No saved scorecards.</p>'; return; }
            console.log(`Total scorecards found: ${scorecards.length}`);

            const displayLimit = 4;
             const createScorecardElement = (key, data, isLatest) => {
                 try {
                     const w = document.createElement('div');
                     w.className = `scorecard-entry${isLatest ? ' latest-scorecard' : ''}`;
                     let tL = 0, fC = 0, sp = new Set(), lF = null;
                     const fish = data.fishData || [];
                     fish.forEach(f => { const l = f.length || 0; fC++; tL += l; if (f.species) sp.add(f.species); if (!lF || l > (lF.length || 0)) lF = f; });
                     const spC = sp.size;
                     const lFS = lF ? `${lF.species || '?'}(${lF.length || '?'}cm)` : 'N/A';
                     const eK = key.replace(/'/g, "\\'");

                     const viewNoteButtonHtml = (data.notes && data.notes.trim() !== '')
                        ? `<button class="btn btn-secondary btn-sm" onclick="viewNote('${eK}', event)"><i class="bi bi-eye me-1"></i>View Note</button>`
                        : '';

                     w.innerHTML = `<div class="scorecard-item" onclick="toggleScorecardDetails('${eK}',this)">
                        <i class="bi bi-chevron-right me-2"></i>
                        <strong>${data.currentVenue || '?'}</strong> - ${formatDate(data.currentDate || '')}
                        <span class="text-muted ms-2">(${fC} fish, ${tL}cm)</span>
                        ${isLatest ? '<span class="badge ms-2">Latest</span>' : ''}
                        <button class="btn btn-danger btn-sm float-end delete-scorecard-btn" onclick="deleteScorecard('${eK}', event)" style="margin-left: 10px; padding: 0.25rem 0.5rem; line-height: 1;">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                        <div class="scorecard-details" id="details_${key}">
                            <h6>Session Details</h6>
                            <p><strong>Angler:</strong> ${data.currentAngler || '?'}</p>
                            <p><strong>Venue:</strong> ${data.currentVenue || '?'}</p>
                            <p><strong>Date:</strong> ${formatDate(data.currentDate || '')}</p>
                            ${data.currentZone ? `<p><strong>Zone:</strong> ${data.currentZone}</p>` : ''}
                            ${data.currentPeg ? `<p><strong>Peg:</strong> ${data.currentPeg}</p>` : ''}
                            ${data.verifier ? `<p><strong>Verified By:</strong> ${data.verifier}</p>` : ''}
                            <hr>
                            <h6>Catch (${fC})</h6>
                            ${fish.length > 0 ? `<div class="table-responsive"><table class="table table-sm table-striped"><thead><tr><th>#</th><th>Species</th><th>Len(cm)</th></tr></thead><tbody>${fish.map((f, i) => `<tr><td>${i + 1}</td><td>${f.species || '?'}</td><td>${f.length || '?'}</td></tr>`).join('')}</tbody></table></div>` : '<p>No fish.</p>'}
                            ${fish.length > 0 ? `<hr><h6>Summary</h6><p><strong>Total Len:</strong> ${tL}cm</p><p><strong>Species:</strong> ${spC}</p><p><strong>Longest:</strong> ${lFS}</p>` : ''}

                            <div class="btn-actions-group">
                                ${viewNoteButtonHtml}
                                <button class="btn btn-outline-secondary btn-sm" onclick="openNotesModal('${eK}', event)"><i class="bi bi-pencil me-1"></i>Add/Edit Note</button>
                                <button class="btn btn-info btn-sm" onclick="emailScorecard('${eK}', event)"><i class="bi bi-envelope me-1"></i>Email</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteScorecard('${eK}', event)"><i class="bi bi-trash me-1"></i>Delete</button>
                            </div>
                        </div>`;
                     return w;
                 } catch (elementError) {
                     console.error(`Err create el for ${key}:`, elementError);
                     const errDiv = document.createElement('div');
                     errDiv.className = 'alert alert-warning p-2 my-2';
                     errDiv.textContent = `Err display card ${key.slice(-4)}`;
                     return errDiv;
                 }
             }; // End of createScorecardElement


            try { console.log(`Slicing initial (0 to ${displayLimit})`); const initial = scorecards.slice(0, displayLimit); console.log(`Displaying ${initial.length} initial.`); initial.forEach(({ key, data }, index) => { const el = createScorecardElement(key, data, index === 0); if (el) savedScorecardsList.appendChild(el); }); }
            catch(e) { console.error("Err initial loop:", e); savedScorecardsList.innerHTML += '<p class="text-danger p-3">Err display initial.</p>'; }

            console.log(`Check need Older button: ${scorecards.length} > ${displayLimit}?`);
            if (scorecards.length > displayLimit) {
                 console.log("Condition MET: Creating 'Older' button.");
                 if (!olderScorecardsToggleContainer) { console.error("Cannot create 'Older' button - container missing!"); return; }
                 const olderCount = scorecards.length - displayLimit;
                 const showOlderBtn = document.createElement('button'); showOlderBtn.id = 'showOlderBtn'; showOlderBtn.className = 'btn btn-outline-secondary'; showOlderBtn.textContent = `View ${olderCount} Older Scorecard${olderCount > 1 ? 's' : ''}`;
                 showOlderBtn.onclick = function() { console.log("'Older' clicked."); try { const older = scorecards.slice(displayLimit); console.log(`Appending ${older.length} older.`); older.forEach(({ key, data }) => { const el = createScorecardElement(key, data, false); if (el) savedScorecardsList.appendChild(el); }); olderScorecardsToggleContainer.innerHTML = ''; console.log("Older appended, btn removed."); } catch(e) { console.error("Err create/append older:", e); olderScorecardsToggleContainer.innerHTML = '<p class="text-danger">Err display older.</p>'; } };
                 olderScorecardsToggleContainer.appendChild(showOlderBtn); console.log("'Older' button added.");
            } else { console.log("Condition NOT MET: No 'Older' button needed."); }
        } // End of loadScorecards


        function toggleScorecardDetails(key, element){console.log("Toggle:",key); const d=document.getElementById(`details_${key}`), i=element.querySelector('i.bi'); if(d){const v=d.style.display==='block'; d.style.display=v?'none':'block'; if(i){i.classList.toggle('bi-chevron-right',v);i.classList.toggle('bi-chevron-down',!v);} element.classList.toggle('details-visible',!v);}else{console.error("Details missing:",key);}}
        function deleteScorecard(key, event){event.stopPropagation(); console.log("Delete:",key); let sN=`card ${key.slice(-6)}`; try{const d=JSON.parse(localStorage.getItem(key)||'{}'); sN=`card for ${d.currentAngler||'?'} on ${formatDate(d.currentDate||'')}`;}catch(e){} if(confirm(`Delete ${sN}? Cannot undo.`)){try{localStorage.removeItem(key);console.log("Deleted:",key);loadScorecards();}catch(e){console.error("Delete err:",e);alert("Failed delete.");}}else{console.log("Delete cancel.");}}

        function emailScorecard(key, event) {
            event.stopPropagation(); console.log("Emailing:", key);
            alert("This will open your default email app. Notes are NOT included.");

            let data; try { const dS = localStorage.getItem(key); if (!dS) throw new Error("Not found."); data = JSON.parse(dS); if (!data?.currentAngler || !data.currentDate || !data.currentVenue || !Array.isArray(data.fishData)) throw new Error("Invalid data."); } catch (error) { console.error("Email data err:", error); alert(`Error getting data: ${error.message}`); return; }
            let body = "Sea Catch Scorecard\r\n=====================\r\n\r\n";
            body += "Session Details:\r\n"; body += `Angler: ${data.currentAngler||'?'}\r\n`; body += `Date: ${formatDate(data.currentDate||'')}\r\n`; body += `Venue: ${data.currentVenue||'?'}\r\n`; if(data.currentZone)body+=`Zone: ${data.currentZone}\r\n`; if(data.currentPeg)body+=`Peg: ${data.currentPeg}\r\n`; if(data.verifier)body+=`Verified By: ${data.verifier}\r\n`; body += "\r\n";
            body += "Catch List:\r\n"; if(data.fishData?.length>0){data.fishData.forEach((f,i)=>{body+=`${i+1}. ${f.species||'?'} - ${f.length||'?'} cm\r\n`;});}else{body+="No fish.\r\n";} body+="\r\n";
            let tL=0,fC=0,sp=new Set(),lF=null; const fish=data.fishData||[]; fish.forEach(f=>{const l=f.length||0;fC++;tL+=l;if(f.species)sp.add(f.species);if(!lF||l>(lF.length||0))lF=f;}); const spC=sp.size; const lFS=lF?`${lF.species||'?'}(${lF.length||'?'}cm)`:'N/A';
            body += "Summary:\r\n"; body += `Total Fish: ${fC}\r\n`; body += `Total Length: ${tL} cm\r\n`; body += `Unique Species: ${spC}\r\n`; body += `Longest Fish: ${lFS}\r\n\r\n=====================\r\n`;
            const subject = `Fishing Scorecard: ${data.currentVenue||'?'} - ${formatDate(data.currentDate||'')}`;
            const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            if(mailtoUrl.length>1800){console.warn(`Mailto long (${mailtoUrl.length})`); alert("Warning: Scorecard long.");}
            console.log("Mailto len:", mailtoUrl.length); try{window.open(mailtoUrl,'_self');}catch(e){console.error("Mailto err:",e);alert("Could not open email client.");}
        }

        // --- Notes Modal Functions ---
        function openNotesModal(key, event) { if(event) event.stopPropagation(); console.log('Opening notes modal for key:', key); const notesTextarea = document.getElementById('notesTextarea'), notesModalKeyInput = document.getElementById('notesModalScorecardKey'); if (!notesTextarea || !notesModalKeyInput || !notesModalInstance) { console.error('Notes modal elements/instance missing!'); alert('Error opening notes editor.'); return; } try { const dS=localStorage.getItem(key); const data=dS?JSON.parse(dS):{}; notesTextarea.value=data.notes||''; } catch(e){ console.error('Error loading notes for modal:',e); notesTextarea.value=''; } notesModalKeyInput.value = key; notesModalInstance.show(); }
        function saveNoteFromModal() { console.log('Save notes modal clicked.'); const notesTextarea = document.getElementById('notesTextarea'), notesModalKeyInput = document.getElementById('notesModalScorecardKey'); if (!notesTextarea || !notesModalKeyInput || !notesModalInstance) { alert('Error saving notes.'); return; } const key = notesModalKeyInput.value; const newNotes = notesTextarea.value; if (!key) { alert('Error: Scorecard key missing.'); return; } try { const dS = localStorage.getItem(key); if (!dS) throw new Error('Scorecard data not found.'); let data = JSON.parse(dS); data.notes = newNotes; localStorage.setItem(key, JSON.stringify(data)); console.log('Notes saved via modal for key:', key); notesModalInstance.hide(); setTimeout(loadScorecards, 150); } catch (e) { console.error('Error saving notes from modal:', e); alert(`Failed to save notes: ${e.message}`); } }
        function viewNote(key, event) { event.stopPropagation(); console.log('Viewing notes for key:', key); try { const dS=localStorage.getItem(key); const data=dS?JSON.parse(dS):{}; const notes=data.notes||''; alert(`Notes for scorecard:\n--------------------\n${notes || '(No notes saved)'}`); } catch (e) { console.error('Error retrieving notes:', e); alert('Could not retrieve notes.'); } }
        // --- End Notes Functions ---


        // --- General Modal Hiding/Showing ---
        function hideModal(modalId) { const mE=document.getElementById(modalId); if(mE){const m=bootstrap.Modal.getInstance(mE); if(m){m.hide();}else{mE.classList.remove('show');mE.style.display='none';const b=document.querySelector('.modal-backdrop');if(b)b.remove();document.body.classList.remove('modal-open');document.body.style.overflow='';document.body.style.paddingRight='';}}}
        function showModal(modalId) { const modalElement = document.getElementById('modalId'); if(modalElement) { const instance = bootstrap.Modal.getOrCreateInstance(modalElement, {backdrop: 'static', keyboard: false}); instance.show(); } else { console.error(`Modal element #${modalId} not found!`); } }

        // --- Application Reset ---
        function resetApp() {
            console.log("Resetting app.");
            fishData=[]; currentAngler=null; currentDate=null; currentVenue=null; currentZone=null; currentPeg=null; currentPage='splashScreen';
            deactivateAppMode();
            try {
               document.getElementById('anglerName').value=''; document.getElementById('competitionDate').value=''; document.getElementById('venueInput').value=''; document.getElementById('isCompetition').checked=false; document.getElementById('zoneInput').value=''; document.getElementById('pegInput').value=''; toggleCompetitionFields(); document.getElementById('speciesInput').value=''; document.getElementById('customSpeciesInput').value=''; document.getElementById('customSpeciesInput').style.display='none'; document.getElementById('lengthInput').value=''; document.getElementById('fishLog').innerHTML='';
               // Hide verifier section inside modal (if it exists and is visible)
               const vS = document.getElementById('verifierEndModalSection'); if(vS) vS.style.display='none';
               const vI = document.getElementById('verifierEndModalInput'); if(vI) vI.value='';
               populateTallySummaryFields(); document.getElementById('tallyTable').innerHTML=''; document.getElementById('tallyTotalLength').textContent='0 cm'; document.getElementById('tallySpeciesCount').textContent='0'; document.getElementById('longestFishSpecies').textContent='N/A'; document.getElementById('longestFishLength').textContent='0 cm';
            } catch(e) { console.error("Error resetting forms:", e); }
        }

        // --- Initialisation ---
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOM loaded.");
            try {
                 // --- Service Worker Registration ---
                 if ('serviceWorker' in navigator) {
                     window.addEventListener('load', () => {
                         navigator.serviceWorker.register('/Sea-Catch-Scorer/sw.js') // <<< EDIT THIS PATH!!!
                             .then(reg => console.log('SW registered scope: ', reg.scope))
                             .catch(err => console.error('SW registration failed: ', err));
                     });
                 } else { console.log('Service workers not supported.'); }
                 // --- End Service Worker Registration ---

                 window.addEventListener('popstate', handleBackButton); window.addEventListener('beforeunload', handleBeforeUnload); console.log("Nav listeners attached.");
                 const refs = { continueBtn: document.getElementById('continueBtn'), viewScorecardsBtn: document.getElementById('viewScorecardsBtn'), startRecordingBtn: document.getElementById('startRecordingBtn'), isCompetitionCheck: document.getElementById('isCompetition'), speciesSelect: document.getElementById('speciesInput'), addFishBtn: document.getElementById('addFishBtn'), backFromFishingBtn: document.getElementById('backFromFishingBtn'), endSessionBtn: document.getElementById('endSessionBtn'), confirmEndBtn: document.getElementById('confirmEndBtn'), backFromTallyBtn: document.getElementById('backFromTallyBtn'), closeModalBtn: document.getElementById('closeModalBtn'), restoreSessionBtn: document.getElementById('restoreSessionBtn'), startNewSessionBtn: document.getElementById('startNewSessionBtn'), anglerNameInput: document.getElementById('anglerName'), competitionDateInput: document.getElementById('competitionDate'), venueInput: document.getElementById('venueInput'), zoneSelect: document.getElementById('zoneInput'), pegSelect: document.getElementById('pegInput') /* No verifier input ref needed here */ };
                 // Add listeners checking if ref exists
                 if (refs.continueBtn) refs.continueBtn.addEventListener('click', startApp);
                 if (refs.viewScorecardsBtn) refs.viewScorecardsBtn.addEventListener('click', showScorecardsModal);
                 if (refs.startRecordingBtn) refs.startRecordingBtn.addEventListener('click', startRecording);
                 if (refs.isCompetitionCheck) refs.isCompetitionCheck.addEventListener('change', () => { toggleCompetitionFields(); saveTempSession(); });
                 if (refs.speciesSelect) refs.speciesSelect.addEventListener('change', toggleCustomSpeciesInput);
                 if (refs.addFishBtn) refs.addFishBtn.addEventListener('click', addFish);
                 if (refs.backFromFishingBtn) refs.backFromFishingBtn.addEventListener('click', backFromFishing);
                 if (refs.endSessionBtn) refs.endSessionBtn.addEventListener('click', showEndSessionModal); // Reverted listener target
                 if (refs.confirmEndBtn) refs.confirmEndBtn.addEventListener('click', confirmEndSession); // Reverted listener target
                 // Removed verifier modal button listener
                 if (refs.backFromTallyBtn) refs.backFromTallyBtn.addEventListener('click', backFromTally);
                 if (refs.restoreSessionBtn) refs.restoreSessionBtn.addEventListener('click', restoreSession);
                 if (refs.startNewSessionBtn) refs.startNewSessionBtn.addEventListener('click', startNewSession);
                 // Input listeners
                 if (refs.anglerNameInput) refs.anglerNameInput.addEventListener('input', () => { currentAngler = refs.anglerNameInput.value.trim(); saveTempSession(); });
                 if (refs.competitionDateInput) refs.competitionDateInput.addEventListener('change', () => { currentDate = refs.competitionDateInput.value; saveTempSession(); });
                 if (refs.venueInput) refs.venueInput.addEventListener('input', () => { currentVenue = refs.venueInput.value.trim(); saveTempSession(); });
                 if (refs.zoneSelect) refs.zoneSelect.addEventListener('change', () => { currentZone = refs.isCompetitionCheck?.checked ? refs.zoneSelect.value : null; saveTempSession(); });
                 if (refs.pegSelect) refs.pegSelect.addEventListener('change', () => { currentPeg = refs.isCompetitionCheck?.checked ? refs.pegSelect.value : null; saveTempSession(); });

                 // Initialize the notes modal instance
                 const notesModalElement = document.getElementById('notesModal');
                 if (notesModalElement) { notesModalInstance = new bootstrap.Modal(notesModalElement); }
                 else { console.error("Notes Modal element (#notesModal) not found in HTML!"); }
                 // No verifier modal instance to initialize

                 checkRestoreSession();
             } catch (error) { console.error("Fatal init error:", error); document.body.innerHTML = `<div class="alert alert-danger m-5">App Error: ${error.message}. Please refresh.</div>`; }
        });
