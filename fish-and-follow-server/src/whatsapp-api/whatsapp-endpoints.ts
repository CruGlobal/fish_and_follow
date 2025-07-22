import { Router, Request, Response } from 'express';
import { sendMessage, sendTemplateMessage, getTemplateMessages } from './whatsapp';
import {
  SendMessageRequest,
  SendTemplateMessageRequest,
  WhatsAppTemplate,
  WhatsAppTemplatesResponse,
  ApiResponse,
} from './whatsapp-types';

import { LanguagesEnum } from 'whatsapp/build/types/enums';

const router = Router();

// Root endpoint
router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'WhatsApp API root' });
});

// Send regular message endpoint
router.post('/send', async (req: Request, res: Response) => {
  try {
    const body = req.body as SendMessageRequest;
    const to = Number(body.to);
    const message = body.message;

    // Validate required fields
    if (!body.to || !body.message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to and message',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    if (isNaN(to)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    await sendMessage(to, message);
    res.status(200).json({
      success: true,
      data: { message: 'Message sent successfully' },
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

// Send template message endpoint
router.post('/template', async (req: Request, res: Response) => {
  try {
    console.log('=== Template endpoint called ===');
    const body = req.body as SendTemplateMessageRequest;
    const to = Number(body.to);
    const templateName = body.template || 'hello_world';
    const language = (body.language || 'en_US') as LanguagesEnum;

    // Validate required fields
    if (!body.to) {
      console.log('❌ Missing required field: to');
      return res.status(400).json({
        success: false,
        error: 'Missing required field: to',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    if (isNaN(to)) {
      console.log('❌ Invalid phone number format:', body.to);
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }

    // Use provided parameters or defaults for template
    const params: Record<string, string> = body.params || {};

    const result = await sendTemplateMessage(to, templateName, language, params);

    if (result.success) {
      res.status(200).json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    } else {
      console.error('❌ Error sending template message:', result.data);
      res.status(400).json({
        success: false,
        error: result.data?.message || 'Failed to send template message',
        details: result.data?.error_data ? JSON.stringify(result.data.error_data) : 'Unknown error',
        timestamp: new Date().toISOString(),
      } as ApiResponse);
    }
  } catch (error) {
    console.error('❌ Error in template endpoint:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: 'Failed to send template message',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

// Get all templates endpoint
router.get('/templates', async (req: Request, res: Response) => {
  try {
    console.log('=== Templates endpoint called ===');

    console.log('Calling getTemplateMessages...');
    const rawTemplates = (await getTemplateMessages()) as WhatsAppTemplatesResponse;
    console.log('✅ getTemplateMessages completed successfully');

    // Transform the raw API response into a cleaner format
    const cleanTemplates: WhatsAppTemplate[] =
      rawTemplates?.data?.map((template) => ({
        name: template.name,
        language: template.language,
        status: template.status,
        category: template.category,
        id: template.id,
        // Include components for detailed view if needed
        components: template.components
          ?.map((comp) => ({
            type: comp.type,
            text: comp.text,
            format: comp.format,
            buttons: comp.buttons,
            example: comp.example,
          }))
          .filter((comp) => comp.text || comp.buttons), // Only include meaningful components
      })) || [];

    res.status(200).json({
      success: true,
      templates: cleanTemplates,
      total: cleanTemplates.length,
      timestamp: new Date().toISOString(),
      // Include raw data option via query parameter
      ...(req.query.raw === 'true' && { raw_data: rawTemplates }),
    });
  } catch (error) {
    console.error('❌ Error in templates endpoint:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve template messages',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

// Debug endpoint
router.get('/debug', (req: Request, res: Response) => {
  try {
    const envVars = {
      WA_SENDER_PHONE_NUMBER: process.env.WA_SENDER_PHONE_NUMBER,
      WA_PHONE_NUMBER_ID: process.env.WA_PHONE_NUMBER_ID,
      WA_BUSINESS_ACCOUNT_ID: process.env.WA_BUSINESS_ACCOUNT_ID,
      WA_BUSSINESS_ACCOUNT_ID: process.env.WA_BUSSINESS_ACCOUNT_ID,
      CLOUD_API_ACCESS_TOKEN: process.env.CLOUD_API_ACCESS_TOKEN ? '***HIDDEN***' : 'NOT SET',
      CLOUD_API_VERSION: process.env.CLOUD_API_VERSION,
    };

    res.json({
      success: true,
      message: 'WhatsApp configuration debug info',
      environment: envVars,
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    } as ApiResponse);
  }
});

export default router;
