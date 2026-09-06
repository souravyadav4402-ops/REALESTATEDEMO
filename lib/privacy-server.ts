import { hasConfiguredValues } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

const deploymentVariables = [
  "PRIVACY_CONTROLLER_NAME",
  "PRIVACY_CONTACT_EMAIL",
  "PUBLIC_SITE_URL",
  "PUBLIC_STUDIO_PHONE",
  "PUBLIC_WHATSAPP_URL",
];

export function privacyDeploymentReady() {
  if (!hasConfiguredValues(...deploymentVariables)) return false;
  const values = {
    controllerName: process.env.PRIVACY_CONTROLLER_NAME!.trim(),
    contactEmail: process.env.PRIVACY_CONTACT_EMAIL!.trim().toLowerCase(),
    siteUrl: process.env.PUBLIC_SITE_URL!.trim(),
    phone: process.env.PUBLIC_STUDIO_PHONE!.trim(),
    whatsappUrl: process.env.PUBLIC_WHATSAPP_URL!.trim(),
  };
  if (values.controllerName === siteConfig.brand.legalName || values.contactEmail === siteConfig.brand.email || values.phone === siteConfig.brand.phone || values.whatsappUrl === siteConfig.brand.whatsapp || values.siteUrl === siteConfig.baseUrl) return false;
  try {
    return /^\S+@\S+\.\S+$/.test(values.contactEmail)
      && new URL(values.siteUrl).protocol === "https:"
      && new URL(values.whatsappUrl).protocol === "https:";
  } catch {
    return false;
  }
}

export function privacyController() {
  const ready = privacyDeploymentReady();
  return ready ? {
    isDemo: false,
    controllerName: process.env.PRIVACY_CONTROLLER_NAME!.trim(),
    contactEmail: process.env.PRIVACY_CONTACT_EMAIL!.trim(),
    siteUrl: process.env.PUBLIC_SITE_URL!.trim(),
    phone: process.env.PUBLIC_STUDIO_PHONE!.trim(),
    whatsappUrl: process.env.PUBLIC_WHATSAPP_URL!.trim(),
  } : {
    isDemo: true,
    controllerName: siteConfig.brand.legalName,
    contactEmail: siteConfig.brand.email,
    siteUrl: siteConfig.baseUrl,
    phone: siteConfig.brand.phone,
    whatsappUrl: siteConfig.brand.whatsapp,
  };
}
