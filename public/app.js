/** FRONTEND: Fetch + DOM. Ingen direkte databaseadgang. */
const $ = selector => document.querySelector(selector);
const message = text => { $('#message').textContent = text; };
let editingMemberId = null; //for keeping track of the member being edited as the create form is reused for this too

async function request(url, options) {
    const response = await fetch(url, options);
    if (response.status === 204) return null;
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Ukendt fejl');
    return body;
}

async function loadMembers(name = '') {
    try {
        const members = await request(`/api/members?name=${encodeURIComponent(name)}`);

        const tbody = $('#members');
        tbody.replaceChildren();

        for (const member of members) {
            const row = document.createElement('tr');

            const nameCell = document.createElement('td');
            nameCell.textContent = member.name;

            const positionCell = document.createElement('td');
            positionCell.textContent = member.position;

            const actionsCell = document.createElement('td');

            // Keep your existing edit and remove button creation and event handlers here.
            const remove = document.createElement('button');
            remove.textContent = 'Slet';
            remove.classList.add('delete-button');
            remove.addEventListener('click', async () => {
                //Confirm deletion before completing it
                if (!window.confirm(`Er du sikker på, at du vil slette ${member.name}?`)) {
                    return;
                }
                try { await request(`/api/members/${member.id}`, { method: 'DELETE' }); await loadMembers(name); }
                catch (error) { message(error.message); }
            });
            //MY ADDITION:
            const edit = document.createElement('button');
            edit.textContent = 'Rediger';
            edit.addEventListener('click', () => {
                editingMemberId = member.id;
                $('#create [name="name"]').value = member.name;
                $('#create [name="position"]').value = member.position;
                $('#create [name="party"]').value = member.party;
                $('#create button[type="submit"]').textContent = 'Opdatér'; //Change the button text in the form when editing
                $('#create-edit-heading').textContent = 'Redigér medlem';
                $('#cancel-edit').hidden = false; //Show the "cancel edit" button when editing
            });

            actionsCell.append(edit, remove);
            row.append(nameCell, positionCell, actionsCell);
            tbody.append(row);
        }
        message(`${members.length} medlemmer fundet`);
    } catch (error) { message(error.message); }
}

$('#search').addEventListener('submit', event => {event.preventDefault(); loadMembers($('#name').value);});
$('#all').addEventListener('click', () => {$('#name').value='';loadMembers();});

//submit form handler -> both create and delete
$('#create').addEventListener('submit', async event => {
    event.preventDefault();
    $('#form-error').textContent = ''; //clear any previous error messages

    const form = new FormData(event.target);
    const body = Object.fromEntries(form.entries());
    const editing = editingMemberId !== null; //to check if the form is editing an existing user

    //set the correct URL based on editing or creating
    const url = editing ? `/api/members/${editingMemberId}` : '/api/members';

    try {
        await request(url, {
            method: editing ? 'PATCH' : 'POST', //set the correct method based on editing or creating
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        editingMemberId = null //reset editingId after successful edit
        $('#cancel-edit').hidden = true;
        $('#create button[type="submit"]').textContent = 'Opret'; //reset button to create
        $('#create-edit-heading').textContent = 'Opret et medlem'; //reset heading to create
        event.target.reset(); await loadMembers();
    } catch (error) {
        message(error.message);
        $('#form-error').textContent = error.message; //show error message in UI
    }
});

$('#cancel-edit').addEventListener('click', () => {
    editingMemberId = null;
    $('#create').reset();
    $('#create button[type="submit"]').textContent = 'Opret';
    $('#create-edit-heading').textContent = 'Opret et medlem';
    $('#cancel-edit').hidden = true;
});

$('#external').addEventListener('click', async () => {
    const list = $('#members-external'); list.replaceChildren();
    try {
        const members = await request('/api/external/members');
        for (const member of members) {
            const li = document.createElement('li');

            const name = document.createElement('strong');
            name.textContent = member.name;

            const id = document.createElement('span');
            id.textContent = ` (ID: ${member.externalId})`;

            const details = document.createElement('p');
            details.textContent =
                `Profession: ${member.profession || 'ukendt'} | Parti: ${member.party || 'ukendt'} (${member.partyShortname || 'ukendt'})`;

            //<img> doesn't display image due to security verification when accessing the image. Displaying as a link to the URL for now instead
            const a = document.createElement('a');a.href=member.pictureMiRes;a.target='_blank';a.rel='noopener';a.textContent=`${member.name}s billede (åbner i ny fane)`;

            li.append(name, id, details, a);
            list.append(li);
        }
    } catch (error) { message(error.message); }
});
loadMembers();
