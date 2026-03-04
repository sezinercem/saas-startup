/**
 * NexaFlow — Demo Data Seeder
 * Called once after a new user signs up.
 * Seeds workflows, agents, integrations, and sample executions.
 */
window.seedDemoData = async function (userId) {
  const s = window.sb;

  // ----- WORKFLOWS -----
  const workflowDefs = [
    { name: 'Customer Onboarding', description: 'Automates the full customer onboarding sequence: welcome email, CRM record creation, Slack notification, and task assignment.', status: 'active', trigger_type: 'webhook', node_count: 8, run_count: 12412, success_count: 12389 },
    { name: 'Billing Reconciliation', description: 'Matches Stripe invoices with QuickBooks records daily and flags discrepancies for finance team review.', status: 'active', trigger_type: 'schedule', schedule_cron: '0 9 * * *', node_count: 6, run_count: 64221, success_count: 63980 },
    { name: 'Support Triage', description: 'Classifies incoming Zendesk tickets by priority and category using AI, then routes to the correct team.', status: 'active', trigger_type: 'webhook', node_count: 5, run_count: 58940, success_count: 58287 },
    { name: 'Weekly Executive Report', description: 'Aggregates KPIs from Stripe, HubSpot, and BigQuery every Monday and emails a formatted PDF to leadership.', status: 'active', trigger_type: 'schedule', schedule_cron: '0 8 * * 1', node_count: 7, run_count: 8108, success_count: 8108 },
    { name: 'Lead Scoring & Routing', description: 'Scores inbound leads from website forms using AI and routes to the right sales rep based on ICP fit.', status: 'active', trigger_type: 'form', node_count: 6, run_count: 38701, success_count: 37957 },
    { name: 'Invoice Validation', description: 'Validates vendor invoices for duplicates, amount anomalies, and policy compliance before approval.', status: 'paused', trigger_type: 'email', node_count: 4, run_count: 29304, success_count: 29304 },
    { name: 'Email Campaign Automation', description: 'Sends personalized email sequences based on user behavior triggers from Segment events.', status: 'active', trigger_type: 'api', node_count: 9, run_count: 24812, success_count: 24183 },
    { name: 'Social Media Monitor', description: 'Monitors brand mentions across Twitter and LinkedIn using AI sentiment analysis and alerts the team.', status: 'active', trigger_type: 'schedule', schedule_cron: '*/30 * * * *', node_count: 5, run_count: 18244, success_count: 18080 },
    { name: 'Contract Review', description: 'Extracts key clauses, obligations, and risk flags from uploaded PDFs using Claude AI.', status: 'active', trigger_type: 'webhook', node_count: 4, run_count: 8901, success_count: 8875 },
    { name: 'New Employee Provisioning', description: 'Creates accounts in Slack, GitHub, Notion, and email when a new hire is added in HR system.', status: 'draft', trigger_type: 'webhook', node_count: 10, run_count: 0, success_count: 0 },
  ];

  const { data: workflows } = await s.from('workflows').insert(
    workflowDefs.map(w => ({ ...w, user_id: userId,
      last_run_at: w.run_count > 0 ? new Date(Date.now() - Math.random() * 86400000 * 3).toISOString() : null }))
  ).select();

  // ----- EXECUTIONS (sample history) -----
  if (workflows && workflows.length) {
    const execDefs = [];
    const statuses = ['success', 'success', 'success', 'success', 'success', 'success', 'success', 'failed', 'success', 'success'];
    const triggers = ['webhook', 'schedule', 'manual', 'api', 'email'];

    for (let i = 0; i < 60; i++) {
      const wf = workflows[Math.floor(Math.random() * workflows.length)];
      const status = wf.status === 'draft' ? 'cancelled' : statuses[Math.floor(Math.random() * statuses.length)];
      const durationMs = Math.floor(Math.random() * 15000) + 200;
      const startedAt = new Date(Date.now() - Math.random() * 86400000 * 7);
      const completedAt = status !== 'running' ? new Date(startedAt.getTime() + durationMs) : null;
      execDefs.push({
        workflow_id: wf.id,
        user_id: userId,
        workflow_name: wf.name,
        status,
        trigger_type: triggers[Math.floor(Math.random() * triggers.length)],
        started_at: startedAt.toISOString(),
        completed_at: completedAt ? completedAt.toISOString() : null,
        duration_ms: status !== 'running' ? durationMs : null,
        steps_total: wf.node_count,
        steps_completed: status === 'success' ? wf.node_count : status === 'failed' ? Math.floor(Math.random() * wf.node_count) : wf.node_count,
        error_message: status === 'failed' ? 'HTTP 503 — upstream service temporarily unavailable' : null,
      });
    }
    await s.from('executions').insert(execDefs);
  }

  // ----- AI AGENTS -----
  const agentDefs = [
    { name: 'EmailClassifier', emoji: '📧', type: 'Classifier', status: 'active', model: 'claude-sonnet-4-6', description: 'Classifies incoming emails by intent, priority, and department. Routes to the correct workflow branch.', color_from: '#00f5ff', color_to: '#0080ff', tasks_completed: 124000, success_rate: 99.2, avg_response_ms: 380 },
    { name: 'DataExtractor', emoji: '🔍', type: 'Extractor', status: 'active', model: 'claude-haiku-4-5', description: 'Extracts structured data from PDFs, emails, and web pages. Outputs clean JSON.', color_from: '#8b5cf6', color_to: '#ec4899', tasks_completed: 89000, success_rate: 98.7, avg_response_ms: 1200 },
    { name: 'ContentWriter', emoji: '✍️', type: 'Writer', status: 'active', model: 'claude-opus-4-6', description: 'Generates product descriptions, blog posts, email copy, and social content at scale.', color_from: '#00ff87', color_to: '#00b4d8', tasks_completed: 31000, success_rate: 97.4, avg_response_ms: 3800 },
    { name: 'SentimentAnalyzer', emoji: '💬', type: 'Analyzer', status: 'active', model: 'claude-haiku-4-5', description: 'Real-time sentiment and emotion analysis for support tickets and reviews.', color_from: '#f59e0b', color_to: '#ef4444', tasks_completed: 203000, success_rate: 99.8, avg_response_ms: 200 },
    { name: 'LeadRouter', emoji: '🎯', type: 'Router', status: 'active', model: 'claude-sonnet-4-6', description: 'Scores and routes inbound leads to the right sales rep based on ICP match and deal size.', color_from: '#00f5ff', color_to: '#8b5cf6', tasks_completed: 67000, success_rate: 98.1, avg_response_ms: 900 },
    { name: 'InvoiceValidator', emoji: '🧾', type: 'Validator', status: 'idle', model: 'claude-haiku-4-5', description: 'Validates invoice data for compliance, checks for duplicates, and routes approved invoices.', color_from: '#00ff87', color_to: '#8b5cf6', tasks_completed: 45000, success_rate: 100, avg_response_ms: 1500 },
    { name: 'SupportTriager', emoji: '🎫', type: 'Classifier', status: 'active', model: 'claude-sonnet-4-6', description: 'Triages support tickets, assigns priority, suggests solutions, and escalates critical items.', color_from: '#ec4899', color_to: '#8b5cf6', tasks_completed: 156000, success_rate: 98.9, avg_response_ms: 500 },
    { name: 'ContractAnalyzer', emoji: '📄', type: 'Analyzer', status: 'active', model: 'claude-opus-4-6', description: 'Analyzes contracts for key clauses, risks, and compliance issues. Generates structured summaries.', color_from: '#f59e0b', color_to: '#00ff87', tasks_completed: 3400, success_rate: 99.7, avg_response_ms: 18000 },
    { name: 'ReportGenerator', emoji: '📊', type: 'Writer', status: 'active', model: 'claude-opus-4-6', description: 'Generates executive reports and data narratives by synthesizing data from multiple sources.', color_from: '#0080ff', color_to: '#00f5ff', tasks_completed: 8200, success_rate: 99.1, avg_response_ms: 12000 },
    { name: 'TranslationAgent', emoji: '🌍', type: 'Writer', status: 'active', model: 'claude-sonnet-4-6', description: 'Translates content across 48 languages while maintaining tone, context, and brand voice.', color_from: '#8b5cf6', color_to: '#00b4d8', tasks_completed: 77000, success_rate: 99.4, avg_response_ms: 1100 },
    { name: 'SlackAgent', emoji: '💬', type: 'Connector', status: 'error', model: 'claude-sonnet-4-6', description: 'Monitors Slack channels for action items, summarizes threads, and sends automated notifications.', color_from: '#ef4444', color_to: '#f59e0b', tasks_completed: 18000, success_rate: 94.2, avg_response_ms: 700 },
    { name: 'CodeReviewer', emoji: '👨‍💻', type: 'Analyzer', status: 'idle', model: 'claude-sonnet-4-6', description: 'Reviews pull requests for code quality, security vulnerabilities, and style guide compliance.', color_from: '#00f5ff', color_to: '#00ff87', tasks_completed: 22000, success_rate: 97.8, avg_response_ms: 4100 },
  ];

  await s.from('agents').insert(agentDefs.map(a => ({ ...a, user_id: userId })));

  // ----- INTEGRATIONS -----
  const integrationDefs = [
    { name: 'Salesforce', emoji: '🔵', category: 'crm', description: 'Sync leads, contacts, deals, and activity data bidirectionally.', connected: true, api_calls_today: 48000, webhooks_count: 6, connected_at: new Date(Date.now() - 86400000 * 60).toISOString() },
    { name: 'HubSpot', emoji: '🟠', category: 'crm', description: 'Connect HubSpot contacts, companies, deals, and email campaigns.', connected: true, api_calls_today: 32000, webhooks_count: 4, connected_at: new Date(Date.now() - 86400000 * 45).toISOString() },
    { name: 'Slack', emoji: '🟣', category: 'communication', description: 'Send messages, create channels, and trigger workflows from Slack events.', connected: true, api_calls_today: 12000, webhooks_count: 3, connected_at: new Date(Date.now() - 86400000 * 55).toISOString() },
    { name: 'Gmail', emoji: '📧', category: 'communication', description: 'Read, send, and classify emails. Trigger workflows on new messages.', connected: true, api_calls_today: 28000, webhooks_count: 2, connected_at: new Date(Date.now() - 86400000 * 50).toISOString() },
    { name: 'GitHub', emoji: '🐙', category: 'devops', description: 'Trigger workflows on PRs, issues, commits, and deployments.', connected: true, api_calls_today: 8000, webhooks_count: 8, connected_at: new Date(Date.now() - 86400000 * 40).toISOString() },
    { name: 'Stripe', emoji: '💳', category: 'payments', description: 'Automate billing, invoicing, subscription management, and charge events.', connected: true, api_calls_today: 22000, webhooks_count: 5, connected_at: new Date(Date.now() - 86400000 * 60).toISOString() },
    { name: 'BigQuery', emoji: '📊', category: 'data', description: 'Query and write to Google BigQuery datasets as workflow steps.', connected: true, api_calls_today: 15000, webhooks_count: 0, connected_at: new Date(Date.now() - 86400000 * 30).toISOString() },
    { name: 'Jira', emoji: '🔷', category: 'devops', description: 'Create, update, and track Jira issues from automated workflows.', connected: true, api_calls_today: 6000, webhooks_count: 3, connected_at: new Date(Date.now() - 86400000 * 20).toISOString() },
    { name: 'Zendesk', emoji: '🟡', category: 'crm', description: 'Create, update, and resolve support tickets automatically.', connected: true, api_calls_today: 11000, webhooks_count: 4, connected_at: new Date(Date.now() - 86400000 * 35).toISOString() },
    { name: 'AWS S3', emoji: '🔶', category: 'devops', description: 'Upload, download, and process files from Amazon S3 buckets.', connected: true, api_calls_today: 4000, webhooks_count: 1, connected_at: new Date(Date.now() - 86400000 * 15).toISOString() },
    { name: 'Intercom', emoji: '🔴', category: 'crm', description: 'Sync customer data, create conversations, and trigger support workflows.', connected: true, api_calls_today: 9000, webhooks_count: 2, connected_at: new Date(Date.now() - 86400000 * 25).toISOString() },
    { name: 'Mailchimp', emoji: '📮', category: 'communication', description: 'Add subscribers, send campaigns, and track email performance.', connected: false, api_calls_today: 0, webhooks_count: 0 },
    { name: 'Snowflake', emoji: '📦', category: 'data', description: 'Read and write to Snowflake data warehouse. Run SQL queries as steps.', connected: false, api_calls_today: 0, webhooks_count: 0 },
    { name: 'Google Calendar', emoji: '📅', category: 'productivity', description: 'Create events, check availability, and trigger workflows on calendar changes.', connected: false, api_calls_today: 0, webhooks_count: 0 },
    { name: 'Notion', emoji: '📝', category: 'productivity', description: 'Read and write Notion pages, databases, and blocks from workflows.', connected: false, api_calls_today: 0, webhooks_count: 0 },
    { name: 'Linear', emoji: '🔗', category: 'devops', description: 'Create issues, update project status, and sync with GitHub automatically.', connected: false, api_calls_today: 0, webhooks_count: 0 },
    { name: 'Twilio', emoji: '💜', category: 'communication', description: 'Send SMS, WhatsApp messages, and make voice calls from workflows.', connected: false, api_calls_today: 0, webhooks_count: 0 },
    { name: 'Airtable', emoji: '🟤', category: 'data', description: 'Read and write Airtable bases as structured workflow data sources.', connected: false, api_calls_today: 0, webhooks_count: 0 },
    { name: 'Mixpanel', emoji: '🟩', category: 'data', description: 'Track events, query funnels, and export user analytics data.', connected: false, api_calls_today: 0, webhooks_count: 0 },
    { name: 'QuickBooks', emoji: '💰', category: 'payments', description: 'Sync invoices, expenses, and customer data with QuickBooks Online.', connected: false, api_calls_today: 0, webhooks_count: 0 },
  ];

  await s.from('integrations').insert(integrationDefs.map(i => ({ ...i, user_id: userId })));

  console.log('[NexaFlow] Demo data seeded successfully.');
};
