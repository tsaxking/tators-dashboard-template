// const elim_allianceSocket = new SubSocket('alliance', socket);
// const elim_alliances = document.querySelector('#elim--alliances');
// const elim_commentListener = elim_allianceSocket.on('comment');
// const elim_allianceTitle = document.querySelector('#elim--alliance-title');
// const elim_allianceCommentsDisplay = document.querySelector('#elim--alliance-comments');
// const elim_commentsContainer = document.querySelector('#elim--comments-container');
// const elim_addComment = document.querySelector('#elim--add-comment');
// const elim_comments = new CustomBootstrap.Input('textarea', {
//     placeholder: 'Add a Comment Here'
// });

// elim_comments.hide();
// elim_commentsContainer.appendChild(elim_comments.el);

// mainFunctions['Eliminations'] = async(page) => {
//     elim_addComment.classList.add('d-none');
//     elim_allianceTitle.innerHTML = '';
//     elim_comments.value = '';
//     elim_comments.hide();
//     elim_allianceCommentsDisplay.innerHTML = '';
//     elim_alliances.innerHTML = `
//         <thead>
//             <tr>
//                 <th>Number</th>
//                 <th>Captain</th>
//                 <th>Team 2</th>
//                 <th>Team 3</th>
//                 <th>Surrogates</th>
//             </tr>
//         </thead>
//         <tbody></tbody>
//     `;



//     await elim_allianceSocket.init(new Array(8).fill(0).map((_, i) => ([currentEvent.info.key, i + 1])));
//     console.log(elim_allianceSocket.data);
//     const alliances = elim_allianceSocket.data.map(a => FIRSTAlliance.fromDatabase(a, currentEvent));


//     const setComment = (comment) => {
//         const p = document.createElement('p');
//         p.textContent = comment;
//         elim_allianceCommentsDisplay.appendChild(p);
//     };


//     const allianceInformation = (alliance) => {
//         elim_addComment.classList.remove('d-none');
//         elim_comments.show();
//         elim_allianceTitle.innerHTML = `Alliance ${alliance.number}`;

//         // add alliance information


//         alliance.comments.forEach(setComment);
//         elim_addComment.dataset.alliance = alliance.number;
//     }

//     const setAllianceRow = (alliance) => {
//         const row = document.createElement('tr');
//         const [captain, team2, team3, ...surrogates] = alliance.teams;

//         const addCell = (text, callback) => {
//             const cell = document.createElement('td');
//             if (callback) cell.addEventListener('click', callback);
            
//             if (text.querySelector) {
//                 cell.appendChild(text);
//             } else {
//                 cell.textContent = text;
//             }
//             row.appendChild(cell);

//             return cell;
//         }

//         const cells = {}

//         cells.number = addCell((() => {
//             const span = document.createElement('span');
//             span.textContent = alliance.number;

//             const comment = document.createElement('i');
//             comment.classList.add('material-icons');
//             comment.classList.add('ml-2');
//             comment.textContent = 'comment';

//             const container = document.createElement('span');
//             container.appendChild(span);
//             if (alliance.comments.length) container.appendChild(comment);

//             return container;
//         })(), () => allianceInformation(alliance));

//         const openTeam = (team) => {
//             return () => {
//                 window.open('/dashboard?team=' + team.number, '_blank');
//             }
//         };

//         cells.captain = addCell(captain.number, openTeam(captain));
//         cells.team2 = addCell(team2.number, openTeam(team2));
//         cells.team3 = addCell(team3.number, openTeam(team3));


//         const buildSurrogates = (surrogates) => {
//             return surrogates.reduce((acc, cur) => {
//                 const p = document.createElement('span');
//                 p.textContent = cur.number;
//                 p.addEventListener('click', openTeam(cur));
//                 acc.appendChild(p);
//                 return acc;
//             }, document.createElement('span'));
//         }

//         cells.surrogates = addCell(buildSurrogates(surrogates));

//         elim_alliances.querySelector('tbody').appendChild(row);

//         // edit alliance data
//         elim_commentListener.on(
//             (newData) => {
//                 const newAlliance = FIRSTAlliance.fromDatabase(newData, currentEvent);

//                 cells.captain.textContent = newAlliance.captain.number;
//                 cells.team2.textContent = newAlliance.team2.number;
//                 cells.team3.textContent = newAlliance.team3.number;
//                 cells.surrogates.innerHTML = '';
//                 cells.surrogates.appendChild(buildSurrogates(newAlliance.surrogates));
//             },
//             (criteria) => {
//                 return (
//                     alliance.number === criteria
//                     && currentPage === page
//                 )
//             }
//         );

//     };        
//     const updateComment = () => {
//         const comment = elim_comments.value;
//         elim_comments.value = '';
//         elim_commentListener.update(comment, [ currentEvent.info.key, +elim_addComment.dataset.alliance ]);
//         setComment(comment);
//     };

//     elim_addComment.addEventListener('click', updateComment);

//     alliances.forEach(setAllianceRow);


//     return () => {
//         elim_addComment.removeEventListener('click', updateComment);
//     }
// };