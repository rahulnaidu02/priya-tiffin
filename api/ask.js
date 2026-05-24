// Vercel serverless function: /api/ask
// Takes a natural-language question, fetches live data from Supabase,
// sends both to Anthropic Claude, returns the answer.

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { question } = req.body || {}
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing question' })
  }

  // Server-side keys, never exposed to the browser
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  if (!supabaseUrl || !supabaseKey || !anthropicKey) {
    return res.status(500).json({
      error: 'Server not configured. Set SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY in Vercel.',
    })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Pull live data from all five tables in parallel
    const [weeks, orders, orderItems, menuItems, library] = await Promise.all([
      supabase.from('weeks').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('order_items').select('*'),
      supabase.from('menu_items').select('*'),
      supabase.from('item_library').select('*'),
    ])

    const dataContext = {
      weeks: weeks.data || [],
      orders: orders.data || [],
      order_items: orderItems.data || [],
      menu_items: menuItems.data || [],
      item_library: library.data || [],
    }

    const systemPrompt = `You are a data analyst for Priya's Tiffin, a home-based meal delivery business.
You have access to the live Supabase database below as JSON.

Answer the user's question in clear, concise language. Use specific numbers from the data.
If the question asks about money, format as currency with a dollar sign.
If a calculation is needed, do the math and show the result, not the formula.
If the data is empty for what was asked, say so plainly.
Keep answers short. No preamble like "Based on the data..." just give the answer.

LIVE DATABASE:
${JSON.stringify(dataContext, null, 2)}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(500).json({ error: `Anthropic API error: ${errText}` })
    }

    const result = await response.json()
    const answer = result.content?.[0]?.text || 'No answer returned.'

    return res.status(200).json({
      answer,
      rowCounts: {
        weeks: dataContext.weeks.length,
        orders: dataContext.orders.length,
        order_items: dataContext.order_items.length,
        menu_items: dataContext.menu_items.length,
      },
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
