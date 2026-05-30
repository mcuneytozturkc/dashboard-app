import emailjs from "@emailjs/browser";

export interface ContactFormData {
  name: string;
  email: string;
  type: string;
  message: string;
}

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

export async function sendContactForm(data: ContactFormData): Promise<void> {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    // Mock response for development
    await new Promise(res => setTimeout(res, 800));
    return;
  }
  await emailjs.send(SERVICE_ID, TEMPLATE_ID, {
    from_name: data.name,
    from_email: data.email,
    message_type: data.type,
    message: data.message,
  }, PUBLIC_KEY);
}
