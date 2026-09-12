'use strict';
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=(file)=>fs.readFileSync(path.join(root,file),'utf8');
const json=(file)=>JSON.parse(read(file));

const manifest=read('manifest.yml');
const development=json('config/development-status.json');
const security=json('config/security-audit.json');
const staging=json('config/staging-status.json');
const marketplace=json('config/marketplace-readiness.json');
const privacy=json('config/privacy-migration.json');
const production=json('config/production-status.json');
const technical=[];
const account=[];

if(/__FORGE_APP_ID__/.test(manifest)) technical.push('FORGE_APP_ID_PLACEHOLDER');
if(!/licensing:\s*\n\s*enabled: true/.test(manifest)) technical.push('LICENSING_NOT_ENABLED');
if(!/appIsLicensed: true/.test(manifest)) technical.push('LICENSED_TRIGGER_FILTER_MISSING');
if(/external:|write:|delete:|manage:/.test(manifest)) technical.push('FORBIDDEN_SCOPE_OR_EGRESS');
if(security.status!=='PASS') technical.push('SECURITY_AUDIT_NOT_PASS');
if(development.runtimeValidation!=='PASS') technical.push('DEVELOPMENT_RUNTIME_NOT_PASS');
if(development.freshInstall!=='PASS') technical.push('FRESH_INSTALL_NOT_PASS');
if(staging.runtimeValidation!=='PASS') technical.push('STAGING_RUNTIME_NOT_PASS');
if(staging.forgeLint!=='PASS') technical.push('STAGING_LINT_NOT_PASS');
if(privacy.development?.status!=='PASS') technical.push('DEVELOPMENT_PRIVACY_MIGRATION_NOT_PASS');
if(privacy.staging?.status!=='PASS') technical.push('STAGING_PRIVACY_MIGRATION_NOT_PASS');
if(production.deployment!=='COMPLETE') technical.push('PRODUCTION_DEPLOYMENT_NOT_COMPLETE');
if(production.currentDeploymentContainsPrivacySchemaV2!==true) technical.push('PRODUCTION_PRIVACY_BUILD_NOT_DEPLOYED');
if(production.installation!=='NOT_INSTALLED_BY_DESIGN') technical.push('PRODUCTION_INSTALL_STATE_UNEXPECTED');
for(const file of ['docs/PRIVACY.md','docs/SECURITY.md','docs/SUPPORT.md','docs/MARKETPLACE_LISTING.md','docs/REVIEWER_INSTRUCTIONS.md']) {
  if(!fs.existsSync(path.join(root,file))) technical.push(`MISSING_${file.toUpperCase().replace(/[^A-Z0-9]+/g,'_')}`);
}

if(!marketplace.partnerProfileCreated) account.push('PARTNER_PROFILE_REQUIRED');
if(!marketplace.partnerAgreementAccepted) account.push('PARTNER_AGREEMENT_REQUIRED');
if(!marketplace.businessDomainEmailConfigured) account.push('BUSINESS_DOMAIN_EMAIL_REQUIRED');
if(!marketplace.developerSpacePublished) account.push('DEVELOPER_SPACE_PUBLISH_REQUIRED');
if(!marketplace.distributionSharingEnabled) account.push('DISTRIBUTION_SHARING_REQUIRED');
if(!marketplace.developerCommunityContactRegistered) account.push('DEVELOPER_COMMUNITY_CONTACT_REQUIRED');
if(!marketplace.privacyUrl) account.push('PUBLIC_PRIVACY_URL_REQUIRED');
if(!marketplace.supportUrl) account.push('PUBLIC_SUPPORT_URL_REQUIRED');
if(marketplace.endUserTermsMode==='ATLASSIAN_STANDARD_AGREEMENT_PLANNED'&&!marketplace.standardAgreementSelected) account.push('STANDARD_EULA_SELECTION_REQUIRED');
if(!marketplace.dpaLegalReviewComplete) account.push('DPA_LEGAL_REVIEW_REQUIRED');
if(!marketplace.payoutAndTaxConfigured) account.push('PAYOUT_TAX_SETUP_REQUIRED');
if(!marketplace.marketplacePricingConfigured) account.push('MARKETPLACE_PRICING_REQUIRED');
if(!marketplace.listingAssetsComplete) account.push('LISTING_ASSETS_REQUIRED');

const report={
  technicalReady:technical.length===0,
  marketplaceReady:technical.length===0&&account.length===0,
  technicalBlockers:technical,
  accountBlockers:account,
};
console.log(JSON.stringify(report,null,2));
if(technical.length) process.exit(2);
if(process.argv.includes('--marketplace')&&account.length) process.exit(3);
