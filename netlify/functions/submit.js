exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { fname, lname, email, role, volume } = JSON.parse(event.body);

    if (!fname || !email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Name and email required' }) };
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Waitlist`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'First Name'  : fname,
            'Last Name'   : lname || '',
            'Email'       : email,
            'Role'        : role || 'Not specified',
            'Video Volume': volume || 'Not specified',
            'Signed Up At': new Date().toISOString(),
            'Source'      : 'Landing Page'
          }
        })
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return { statusCode: 500, body: JSON.stringify({ error: err }) };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};

