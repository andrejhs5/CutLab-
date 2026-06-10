exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { fname, lname, email, role, volume } = body;

    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    // Return error if env vars missing
    if (!apiKey || !baseId) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing env vars', hasKey: !!apiKey, hasBase: !!baseId })
      };
    }

    const url = `https://api.airtable.com/v0/${baseId}/Waitlist`;

    const payload = {
      fields: {
        'First Name': fname || '',
        'Last Name': lname || '',
        'Email': email || '',
        'Role': role || 'Not specified',
        'Video Volume': volume || 'Not specified',
        'Signed Up At': new Date().toISOString(),
        'Source': 'Landing Page'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Airtable error', status: response.status, details: result })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, id: result.id })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message, stack: err.stack })
    };
  }
};
