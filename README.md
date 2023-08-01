# Mail
CS50w Project 3: JavaScript Front-End For Email Client

The app let's users view different mailboxes (Inbox/Sent/Archive), archive emails, as well as compose, send and reply to emails via API - all implemented on a single html template using JavaScript. 

### Specification:
<https://cs50.harvard.edu/web/2020/projects/3/mail/>

### Video Demo:
<https://www.youtube.com/watch?v=AhgNG5h8lrM>

### mail/static/mail/inbox.js
Contains JavaScript front-end implementation.

* compose_email() - loads email compositon view (with optional pre-filled fields).
* load_mailbox() - loads the mailbox view with it's content.
* show_error() - displays error alert at the top of the template.
* GET_emails_mailbox() - submits GET request to API to laod all emails in a mailbox.
* GET_emails_email() - submits GET request to API to load the email.
* POST_emails() - submits POST request to API that sends an email.
* PUT_emails_read() - submits PUT request to API that updates 'read' attribute.
* PUT_emails_archived() - submits PUT request to API that updates 'archived' attribute.
* create_mailbox_element() - generates html elements that dispaly all email snapshots in a given mailbox.
* create_email_view() - generates html element that dispalys the email content.
