document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');

  // Add 'onsubmit' event handler to compose-form element
  document.querySelector('#compose-form').onsubmit = POST_emails;

});

function compose_email(error = '', recipients = '', subject = '', body = '') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Show error 
  show_error(error);

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;

}

function load_mailbox(mailbox, error = '') {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show error 
  show_error(error);

  // Load emails if mailbox provided
  if (mailbox) {
    GET_emails_mailbox(mailbox=='Archived'? 'archive':mailbox.toLowerCase());
  } 

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

}

// Shows error 
function show_error(error) {

  if (error != '') {
    document.querySelector('#emails-error').style.display = 'block';
    document.querySelector('#emails-error').innerHTML = error;
  } else {
    document.querySelector('#emails-error').style.display = 'none';
  }

}

// Loads all mailbox items from the API
function GET_emails_mailbox(mailbox_name) {

  fetch(`/emails/${mailbox_name}`, {cache: "no-store"})
  .then(response => response.json())
  .then(emails => {
    if (emails.error) {
      console.log('Error: ', emails.error);
      load_mailbox(`${mailbox_name}`, error = emails.error);
    } else {
      // For every email 
      emails.forEach(email => {
        // Don't show archive button for sent emails
        let archive_button = mailbox_name == 'sent'? false: true;
        const mailbox_element = create_mailbox_element(email, archive_button);
        document.querySelector('#emails-view').append(mailbox_element);
      });
    }
  });

  return false;

  }

// Loads the email from the API
function GET_emails_email(email_id, archive_button = true) {

  fetch(`/emails/${email_id}`, {cache: "no-store"})
  .then(response => response.json())
  .then(email => {
    if (email.error) {
      console.log('Error: ', email.error);
      load_mailbox('inbox', error = email.error);
    } else {
      console.log(email);
      // Update read attribute
      if (!email.read) {
        PUT_emails_read(email_id, true);
      }
      // Hide all views
      load_mailbox('');
      // Create email view
      const email_view = create_email_view(email, archive_button);
      // Append view to inbox layout 
      document.querySelector('#emails-view').append(email_view);
    }
  });

  return false;

}

// Sends the email via the API
function POST_emails() {

  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    cache: "no-store",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result.error) {
      console.log('Error: ', result.error);
      compose_email(error = result.error, recipients = recipients, subject = subject, body = body);
    } else {
      load_mailbox('sent');
    }
  });

  return false;

}
  
// Updates the email's read attribute via the API
function PUT_emails_read(email_id, read) {

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    cache: "no-store",
    body: JSON.stringify({
      read: read,
    })
  })

  return false;
  
}

// Updates the email's archived attribute via the API
function PUT_emails_archived(email_id, archived) {

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    cache: "no-store",
    body: JSON.stringify({
      archived: archived,
    })
  })
  .then(() => {
    load_mailbox('inbox');
  });

  return false;

}

// Creates HTML mailbox element 
function create_mailbox_element(email, archive_button = true) {

  // https://getbootstrap.com/docs/4.0/components/card/

  // Create card div  
  var mailbox_card = document.createElement('div');
  mailbox_card.id = email.id;
  if (email.read) {
    // If email was read
    mailbox_card.className = 'card bg-white';
  } else {
    // If email wasn't read
    mailbox_card.className = 'card bg-light';
  }
  
  // Create body div 
  var mailbox_card_body = document.createElement('div');
  mailbox_card_body.className = 'card-body';

  // Create container div for sender and timestamp
  var mailbox_sender_container = document.createElement('div');
  mailbox_sender_container.className = 'd-flex w-100 justify-content-between';

  // Create sender title 
  var mailbox_sender = document.createElement('h5'); 
  mailbox_sender.innerHTML = `${email.sender}`;
  mailbox_sender.className = 'card-title';

  // Create timestamp  
  var mailbox_timestamp = document.createElement('small'); 
  mailbox_timestamp.innerHTML = email.timestamp;

  // Create subject title  
  var mailbox_subject = document.createElement('h6'); 
  mailbox_subject.innerHTML = `${email.subject}`;
  mailbox_subject.className = 'card-subtitle mb-2';

  // Append sender and timestamp to container div
  mailbox_sender_container.append(mailbox_sender, mailbox_timestamp);

  // Append container div and subject to body div
  mailbox_card_body.append(mailbox_sender_container, mailbox_subject);

  // Append body div to card div
  mailbox_card.append(mailbox_card_body);

  // Add 'onclick' event handler
  mailbox_card.onclick = function() {
    GET_emails_email(parseInt(email.id), archive_button);
  };

  return mailbox_card;

}

// Creates HTML email element 
function create_email_view(email, archive_button = true) {

  // Create card div  
  var email_card = document.createElement('div');
  email_card.className = 'card bg-white';
  
  // Create body div 
  var email_card_body = document.createElement('div');
  email_card_body.className = 'card-body';

  // Create container div for sender and timestamp
  var email_sender_container = document.createElement('div');
  email_sender_container.className = 'd-flex w-100 justify-content-between';

  // Create sender title 
  var email_sender = document.createElement('h5'); 
  email_sender.innerHTML = `From: ${email.sender}`;
  email_sender.className = 'card-title';

  // Create timestamp  
  var email_timestamp = document.createElement('small'); 
  email_timestamp.innerHTML = email.timestamp;

  // Create subject title  
  var email_subject = document.createElement('h6'); 
  email_subject.innerHTML = `Subject: ${email.subject}`;
  email_subject.className = 'card-subtitle mb-2';

  // Create receiver title 
  var email_recipients = document.createElement('h6'); 
  email_recipients.innerHTML = `To: ${email.recipients}`;
  email_recipients.className = 'card-title';

  // Create body paragraph 
  var email_body = document.createElement('p'); 
  email_body.innerHTML = email.body;
  // Preserve line breaks inside paragraph
  email_body.innerHTML = email_body.innerHTML.replace(/\n/g, '<br>');
  email_body.className = 'card-text';

  // Create reply button container
  var email_button_reply_container = document.createElement('div');
  email_button_reply_container.className = 'btn-group mr-2';

  // Create reply button
  var email_button_reply = document.createElement('button');
  email_button_reply.innerHTML = 'Reply';
  email_button_reply.className = 'btn btn-sm btn-outline-primary';
  email_button_reply.type = 'button';

  // Add 'onclick' event handler to reply button
  email_button_reply.onclick = function() {
    sender = email.sender;
    subject = email.subject.substring(0, 3) == 'Re:'? email.subject: `Re: ${email.subject}`;
    body = `\n\n On ${email.timestamp} ${email.sender} wrote:\n  ${email.body}`;
    compose_email(error = '', recipients = sender, subject = subject, body = body);
  };

  var email_br = document.createElement('hr'); 

  // Append sender and timestamp to container div
  email_sender_container.append(email_sender, email_timestamp);

  // Append reply button to container div
  email_button_reply_container.append(email_button_reply);

  // If archive button activated
  if (archive_button) {
    // Create archive button container
    var email_button_archive_container = document.createElement('div');
    email_button_archive_container.className = 'btn-group mr-2';

    // Create archive button
    var email_button_archive = document.createElement('button');
    if (email.archived) {
      // If email archived
      email_button_archive.innerHTML = 'Unarchive';
    } else {
      // If email not archived
      email_button_archive.innerHTML = 'Archive';
    }
    email_button_archive.className = 'btn btn-sm btn-outline-primary';
    email_button_archive.type = 'button';

    // Add 'onclick' event handler to archive button
    email_button_archive.onclick = function() {
      if (email.archived) {
        // If email archived
        PUT_emails_archived(parseInt(email.id), archived = false);
      } else {
        // If email not archived
        PUT_emails_archived(parseInt(email.id), archived = true);
      }
    };

    // Append archive button to container div
    email_button_archive_container.append(email_button_archive);

    // Append sender, subject, ecipients, reply button, archive button and body to body div
    email_card_body.append(email_sender_container, email_subject, email_recipients, email_button_reply_container, email_button_archive_container, email_br, email_body);

  } else {
    // Append sender, subject, ecipients, reply button and body to body div
    email_card_body.append(email_sender_container, email_subject, email_recipients, email_button_reply_container, email_br, email_body);
  }

  // Append body div to card div
  email_card.append(email_card_body);

  return email_card;

}
