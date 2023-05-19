const fs = require('fs')
const url = require('url')
const arScenario = require('../models/arScenario.js')
const express = require('express')
const router = express.Router()
const { Router } = require('express')

//console.log("line no 8")

router.post('/arscenario', async (req, res) => {
  //  console.log("line no 11")

  var ArScenarioss = [
    {
      value: '',
      label: 'Select',
      type: 'ArScenario',
    },
    {
      value: '1.html',
      label: 'No Claim on File',
      type: 'ArScenario',
    },
    {
      value: 'claim-in-process-1.html',
      label: 'Claim in process',
      type: 'ArScenario',
    },
    {
      value: 'approved-to-pay.html',
      label: 'Claim is approved to pay',
      type: 'ArScenario',
    },
    {
      value: 'claim-paid.html',
      label: 'Claim paid',
      type: 'ArScenario',
    },
    {
      value: 'claim-paid-and-applied-towards-offset.html',
      label: 'Claim paid & applied towards offset',
      type: 'ArScenario',
    },
    {
      value: '100-payment-made-to-patientinsuredrespo.html',
      label: 'Claim paid to patient',
      type: 'ArScenario',
    },
    {
      value: 'blog-post.html',
      label: 'Claim applied towards Deductible',
      type: 'ArScenario',
    },
    {
      value: '31-patient-cannot-be-identified-as-our.html',
      label: 'Claim denied as patient cannot be identified',
      type: 'ArScenario',
    },
    {
      value: '26-expenses-incurred-prior-to.html',
      label: 'Claim denied as Coverage Terminated',
      type: 'ArScenario',
    },
    {
      value: '29-time-limit-for-filing-has-expired.html',
      label: 'Claim denied as the time limit for filing has expired',
      type: 'ArScenario',
    },
    {
      value: '197-precertificationauthorizationnotifi.html',
      label: 'Claim denied as authorization absent or missing',
      type: 'ArScenario',
    },
    {
      value: '288-referral-absent.html',
      label: 'Claim denied as referral is absent or missing',
      type: 'ArScenario',
    },
    {
      value: '119-benefit-maximum-for-this-time_28.html',
      label: 'Claim denied as maximum benefit exhausted/reached',
      type: 'ArScenario',
    },
    {
      value: '96-non-covered-charges.html',
      label: 'Claim denied as non covered charges',
      type: 'ArScenario',
    },
    {
      value: '96-non-covered-charges-provider-is-out.html',
      label: 'Claim denied as non covered charges as provider is out of network',
      type: 'ArScenario',
    },
    {
      value: '227-information-requested-from.html',
      label: 'Claim denied as additional information requested from patient',
      type: 'ArScenario',
    },
    {
      value: '16-claimservice-lacks-information-or.html',
      label: 'Claim denied as additional information requested from provider',
      type: 'ArScenario',
    },
    {
      value: '226-information-requested-from.html',
      label: 'Claim denied as medical records requested',
      type: 'ArScenario',
    },
    {
      value: '18-exact-duplicate-claimservice.html',
      label: 'Claim denied as Duplicate',
      type: 'ArScenario',
    },
    {
      value: 'b9-patient-is-enrolled-in-hospice.html',
      label: 'Claim denied as patient enrolled in hospice',
      type: 'ArScenario',
    },
    {
      value: '4-procedure-code-inconsistent-with.html',
      label: 'Claim denied as procedure code inconsistent with the modifier used',
      type: 'ArScenario',
    },
    {
      value: '182-procedure-modifier-was-invalid-on.html',
      label: 'Claim denied for invalid modifier on date of service',
      type: 'ArScenario',
    },
    {
      value: '11-diagnosis-is-inconsistent-with.html',
      label: 'Claim denied as diagnosis code is inconsistent with the procedure',
      type: 'ArScenario',
    },
    {
      value: '146-diagnosis-was-invalid-for-dates-of.html',
      label: 'Claim denied as diagnosis code is invalid for date of service',
      type: 'ArScenario',
    },
    {
      value: '181-procedure-code-was-invalid-on-date.html',
      label: 'Claim denied as Procedure code was invalid on the date of service',
      type: 'ArScenario',
    },
    {
      value: '183-referring-provider-is-not-eligible.html',
      label: 'Claim denied as referring provider is not eligible to refer the service billed',
      type: 'ArScenario',
    },
    {
      value: '163-attachmentother-documentation.html',
      label: 'Claim denied for primary EOB',
      type: 'ArScenario',
    },
    {
      value: '22-this-care-may-be-covered-by-another.html',
      label: 'Claim denied as other payer is primary',
      type: 'ArScenario',
    },
    {
      value: 'ma04-secondary-payment-cannot-be.html',
      label:
        'Claim denied as Secondary payment cannot be considered without the identity of or payment information from the primary payer',
      type: 'ArScenario',
    },
    {
      value: '109-claimservice-not-covered-by-this.html',
      label: 'Claim denied as claim not covered by this payer',
      type: 'ArScenario',
    },
    {
      value: '24-charges-are-covered-under-capitation.html',
      label:
        'Claim paid directly to provider under Capitation contract/Claim denied as patient covered under capitation or managed care plan',
      type: 'ArScenario',
    },
    {
      value: '58-treatment-was-deemed-by-payer-to.html',
      label: 'Claim denied for invalid place of service',
      type: 'ArScenario',
    },
    {
      value: '23-impact-of-prior-payers-adjudication.html',
      label: 'Claim denied as primary paid more than secondary allowed amount',
      type: 'ArScenario',
    },
    {
      value: '50-these-are-non-covered-services.html',
      label: 'Claim denied as medically not necessity',
      type: 'ArScenario',
    },
    {
      value: '19-this-is-work-related-injuryillness.html',
      label:
        "Claim denied as This is a work-related injury/illness and thus the liability of the Worker's Compensation Carrier",
      type: 'ArScenario',
    },
    {
      value: '20-this-injuryillness-is-covered-by.html',
      label: 'Claim denied as This injury/illness is covered by the liability carrier',
      type: 'ArScenario',
    },
    {
      value: '21-this-injuryillness-is-liability-of.html',
      label:
        'Claim denied as This injury/illness is the liability of the no-fault carrier/Auto insurance',
      type: 'ArScenario',
    },
    {
      value: '97-benefit-for-this-service-is-included.html',
      label: 'Claim denied as Bundle/Inclusive',
      type: 'ArScenario',
    },
    {
      value: 'globally-inclusive-to-surgery_97.html',
      label: 'Claim denied as Globally inclusive to Surgery',
      type: 'ArScenario',
    },
    {
      value: '236-this-procedure-or-proceduremodifier.html',
      label: 'Claim denied as procedure combination is not compatible with another procedure',
      type: 'ArScenario',
    },
    {
      value: '234-this-procedure-is-not-paid.html',
      label: 'Claim denied as procedure code is not paid separately',
      type: 'ArScenario',
    },
    {
      value: '185-rendering-provider-is-not-eligible.html',
      label: 'Claim denied as rendering provider is not eligible to perform the service billed',
      type: 'ArScenario',
    },
    {
      value: '8-procedure-code-is-inconsistent-with.html',
      label: 'Claim denied as the procedure code is inconsistent with provider type/specialty',
      type: 'ArScenario',
    },
    {
      value: '49-this-is-non-covered-service-because_19.html',
      label: 'Claim denied as routine services not covered',
      type: 'ArScenario',
    },
    {
      value: 'this-provider-was-not-certifiedeligible.html',
      label:
        'Claim denied as This provider was not certified/eligible to be paid for this procedure/service on this date of service',
      type: 'ArScenario',
    },
    {
      value: '51-these-are-non-covered-services.html',
      label: 'Claim denied as pre-existing condition not covered',
      type: 'ArScenario',
    },
    {
      value: '7-procedurerevenue-code-is-inconsistent.html',
      label: "Claim denied as Procedure code is inconsistent with patient's gender",
      type: 'ArScenario',
    },
    {
      value: '6-procedurerevenue-code-is-inconsistent.html',
      label: "Claim denied as Procedure code is inconsistent with patient's age",
      type: 'ArScenario',
    },
    {
      value: '10-diagnosis-is-inconsistent-with.html',
      label: "Claim denied as diagnosis code is inconsistent with patient's gender",
      type: 'ArScenario',
    },
    {
      value: '9-diagnosis-is-inconsistent-with.html',
      label: "Claim denied as diagnosis code is inconsistent with patient's age",
      type: 'ArScenario',
    },
    {
      value: 'm119missingincompleteinvalid.html',
      label: 'Claim denied for invalid or missing NDC Code',
      type: 'ArScenario',
    },
    {
      value: 'ma120missingincompleteinvalid-clia.html',
      label: 'Claim denied for invalid or missing CLIA Number',
      type: 'ArScenario',
    },
    {
      value: 'new-patient-established-patient-codes.html',
      label: 'Claim denied for New patient/Established patient criteria not met',
      type: 'ArScenario',
    },
    {
      value: 'how-to-work-on-denial-129-prior.html',
      label: 'Claim denied as Prior processing information appears incorrect',
      type: 'ArScenario',
    },
    {
      value: '151-payment-adjusted-because-payer.html',
      label: 'Claim denied as CPT has reached the maximum allowance for a specific time period',
      type: 'ArScenario',
    },
    {
      value: '13-date-of-death-precedes-date-of.html',
      label: 'Claim denied as the date of death precedes the date of service',
      type: 'ArScenario',
    },
    {
      value: '55-proceduretreatmentdrug-is-deemed.html',
      label:
        'Claim denied as Procedure/treatment/drug is deemed experimental/investigational by the payer',
      type: 'ArScenario',
    },
    {
      value: '199-revenue-code-and-procedure-code-do.html',
      label: 'Claim denied as Revenue code and Procedure code do not match',
      type: 'ArScenario',
    },
  ]
  arScenario.insertMany(ArScenarioss).then((getData) => {
    console.log(getData)
    res.json({
      data: getData,
      Result: true,
    })
  })
})
router.post('/DenialCodes', async (req, res) => {
  var DenialCodess = [
    {
      value: '',
      label: 'Select',
      type: 'DenialCode',
    },
    {
      value: 'blog-post.html',
      label: '1: Deductible Amount',
      type: 'DenialCode',
    },
    {
      value: '4_procedure_code_inconsistent_with.html',
      label:
        '4: The procedure code inconsistent with the modifier used or a required modifier is missing',
      type: 'DenialCode',
    },
    {
      value: '5-procedure-codetype-of-bill-is.html',
      label: '5: The procedure code/type of bill is inconsistent with the place of service',
      type: 'DenialCode',
    },
    {
      value: '6-procedurerevenue-code-is-inconsistent.html',
      label: "6: The procedure/revenue code is inconsistent with the patient's age",
      type: 'DenialCode',
    },
    {
      value: '7-procedurerevenue-code-is-inconsistent.html',
      label: "7: The procedure/revenue code is inconsistent with the patient's gender",
      type: 'DenialCode',
    },
    {
      value: '8-procedure-code-is-inconsistent-with.html',
      label: '8: The procedure code is inconsistent with the provider type/specialty (taxonomy)',
      type: 'DenialCode',
    },
    {
      value: '9-diagnosis-is-inconsistent-with.html',
      label: "9: The diagnosis is inconsistent with the patient's age",
      type: 'DenialCode',
    },
    {
      value: '10-diagnosis-is-inconsistent-with.html',
      label: "10: The diagnosis is inconsistent with the patient's gender",
      type: 'DenialCode',
    },
    {
      value: '11-diagnosis-is-inconsistent-with.html',
      label: '11: The diagnosis is inconsistent with the procedure',
      type: 'DenialCode',
    },
    {
      value: '13-date-of-death-precedes-date-of.html',
      label: '13: The date of death precedes the date of service',
      type: 'DenialCode',
    },
    {
      value: '16-claimservice-lacks-information-or.html',
      label: '16: Claim/service lacks information or has submission/billing error(s)',
      type: 'DenialCode',
    },
    {
      value: '18-exact-duplicate-claimservice.html',
      label: '18: Exact duplicate claim/service',
      type: 'DenialCode',
    },
    {
      value: '19-this-is-work-related-injuryillness.html',
      label:
        "19: This is a work-related injury/illness and thus the liability of the Worker's Compensation Carrier",
      type: 'DenialCode',
    },
    {
      value: '20-this-injuryillness-is-covered-by.html',
      label: '20: This injury/illness is covered by the liability carrier',
      type: 'DenialCode',
    },
    {
      value: '21-this-injuryillness-is-liability-of.html',
      label: '21: This injury/illness is the liability of the no-fault carrier',
      type: 'DenialCode',
    },
    {
      value: '22-this-care-may-be-covered-by-another.html',
      label: '22: This care may be covered by another payer per coordination of benefits',
      type: 'DenialCode',
    },
    {
      value: '23-impact-of-prior-payers-adjudication.html',
      label: '23: The impact of prior payer(s) adjudication including payments and/or adjustment',
      type: 'DenialCode',
    },
    {
      value: '24-charges-are-covered-under-capitation.html',
      label: '24: Charges are covered under a capitation agreement/managed care plan',
      type: 'DenialCode',
    },
    {
      value: '26-expenses-incurred-prior-to.html',
      label: '26: Expenses incurred prior to coverage',
      type: 'DenialCode',
    },
    {
      value: '26-expenses-incurred-prior-to.html',
      label: '27: Expenses incurred after coverage terminated',
      type: 'DenialCode',
    },
    {
      value: '29-time-limit-for-filing-has-expired.html',
      label: '29: The time limit for filing has expired',
      type: 'DenialCode',
    },
    {
      value: '31-patient-cannot-be-identified-as-our.html',
      label: '31: Patient cannot be identified as our insured',
      type: 'DenialCode',
    },
    {
      value: '49-this-is-non-covered-service-because_19.html',
      label:
        '49: This is a non-covered service because it is a routine/preventive exam or a diagnostic/screening procedure done in conjunction with a routine/preventive exam',
      type: 'DenialCode',
    },
    {
      value: '50-these-are-non-covered-services.html',
      label:
        "50: These are non-covered services because this is not deemed a 'medical necessity' by the payer",
      type: 'DenialCode',
    },
    {
      value: '51-these-are-non-covered-services.html',
      label: '51: These are non-covered services because this is a pre-existing condition',
      type: 'DenialCode',
    },
    {
      value: '55-proceduretreatmentdrug-is-deemed.html',
      label: '55: Procedure/treatment/drug is deemed experimental/investigational by the payer',
      type: 'DenialCode',
    },

    {
      value: '58-treatment-was-deemed-by-payer-to.html',
      label:
        '58: Treatment was deemed by the payer to have been rendered in an inappropriate or invalid place of service',
      type: 'DenialCode',
    },

    {
      value: '96-non-covered-charges.html',
      label: '96: Non-Covered Charges',
      type: 'DenialCode',
    },

    {
      value: '97-benefit-for-this-service-is-included.html',
      label:
        '97: The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated',
      type: 'DenialCode',
    },

    {
      value: '100-payment-made-to-patientinsuredrespo.html',
      label: '100: Payment made to Patient/Insured/Responsible party',
      type: 'DenialCode',
    },

    {
      value: '109-claimservice-not-covered-by-this.html',
      label:
        '109: Claim/service not covered by this payer/contractor. You must send the claim/service to the correct payer/contractor',
      type: 'DenialCode',
    },

    {
      value: '119-benefit-maximum-for-this-time_28.html',
      label: '119: Benefit Maximum for this time period or occurrence has been reached',
      type: 'DenialCode',
    },

    {
      value: 'how-to-work-on-denial-129-prior.html',
      label: '129: Prior processing information appears incorrect',
      type: 'DenialCode',
    },

    {
      value: '140-patientinsured-health.html',
      label: '140: Patient/Insured health identification number and name do not match',
      type: 'DenialCode',
    },
    {
      value: '146-diagnosis-was-invalid-for-dates-of.html',
      label: '146: Diagnosis was invalid for the date(s) of service reported',
      type: 'DenialCode',
    },
    {
      value: '151-payment-adjusted-because-payer.html',
      label:
        '151: Payment adjusted because the payer deems the information submitted does not support this many/frequency of services',
      type: 'DenialCode',
    },
    {
      value: '163-attachmentother-documentation.html',
      label: '163: Attachment/other documentation referenced on the claim was not received',
      type: 'DenialCode',
    },
    {
      value: '181-procedure-code-was-invalid-on-date.html',
      label: '181: Procedure code was invalid on the date of service',
      type: 'DenialCode',
    },
    {
      value: '182-procedure-modifier-was-invalid-on.html',
      label: '182: Procedure modifier was invalid on the date of service',
      type: 'DenialCode',
    },
    {
      value: '183-referring-provider-is-not-eligible.html',
      label: '183: The referring provider is not eligible to refer the service billed',
      type: 'DenialCode',
    },
    {
      value: '185-rendering-provider-is-not-eligible.html',
      label: '185: The rendering provider is not eligible to perform the service billed',
      type: 'DenialCode',
    },
    {
      value: '197-precertificationauthorizationnotifi.html',
      label: '197: Precertification/Authorization/Notification/Pre-treatment absent',
      type: 'DenialCode',
    },
    {
      value: '199-revenue-code-and-procedure-code-do.html',
      label: '199: Revenue code and Procedure code do not match',
      type: 'DenialCode',
    },
    {
      value: '226-information-requested-from.html',
      label:
        '226: Information requested from the Billing/Rendering Provider was not provided or not provided timely or was insufficient/incomplete',
      type: 'DenialCode',
    },
    {
      value: '227-information-requested-from.html',
      label:
        '227: Information requested from the patient/insured/responsible party was not provided or was insufficient/incomplete',
      type: 'DenialCode',
    },
    {
      value: '234-this-procedure-is-not-paid.html',
      label: '234: This procedure is not paid separately',
      type: 'DenialCode',
    },
    {
      value: '236-this-procedure-or-proceduremodifier.html',
      label:
        '236: This procedure or procedure/modifier combination is not compatible with another procedure or procedure/modifier combination provided on the same day according to the National Correct Coding Initiative or workers compensation state regulations/ fee schedule requirements',
      type: 'DenialCode',
    },
    {
      value: '96-non-covered-charges-provider-is-out.html',
      label: '242: Services not provided by network/primary care providers',
      type: 'DenialCode',
    },
    {
      value: '288-referral-absent.html',
      label: '288: Referral absent',
      type: 'DenialCode',
    },
    {
      value: 'ma04-secondary-payment-cannot-be.html',
      label:
        'MA04: Secondary payment cannot be considered without the identity of or payment information from the primary payer. The information was either not reported or was illegible',
      type: 'DenialCode',
    },
    {
      value: 'this-provider-was-not-certifiedeligible.html',
      label:
        'B7: This provider was not certified/eligible to be paid for this procedure/service on this date of service',
      type: 'DenialCode',
    },
    {
      value: 'b9-patient-is-enrolled-in-hospice.html',
      label: 'B9: Patient is enrolled in a Hospice',
      type: 'DenialCode',
    },
    {
      value: 'm119missingincompleteinvalid.html',
      label: 'M119: Missing/incomplete/invalid/ deactivated/withdrawn National Drug Code (NDC)',
      type: 'DenialCode',
    },
    {
      value: 'ma120missingincompleteinvalid-clia.html',
      label: 'MA120: Missing/incomplete/invalid CLIA certification number',
      type: 'DenialCode',
    },
  ]
  arScenario.insertMany(DenialCodess).then((getData) => {
    console.log(getData)
    res.json({
      data: getData,
      Result: true,
    })
  })
})
router.post('/rootcausecodes', (req, res) => {
  RootCauseCodes = [
    {
      value: 'Auth',
      label: 'Auth',
      type: 'RootCauseCodes',
    },
    {
      value: 'Referral',
      label: 'Referral',
      type: 'RootCauseCodes',
    },
    {
      value: 'NDC Issue',
      label: 'NDC Issue',
      type: 'RootCauseCodes',
    },
    {
      value: 'Duplicate Claim',
      label: 'Duplicate Claim',
      type: 'RootCauseCodes',
    },
    {
      value: 'Medical Necessity',
      label: 'Medical Necessity',
      type: 'RootCauseCodes',
    },
    {
      value: 'Coding Issue',
      label: 'Coding Issue',
      type: 'RootCauseCodes',
    },
    {
      value: 'Need Invoice',
      label: 'Need Invoice',
      type: 'RootCauseCodes',
    },
    {
      value: 'Coverage Issue',
      label: 'Coverage Issue',
      type: 'RootCauseCodes',
    },
    {
      value: 'TFL Denial',
      label: 'TFL Denial',
      type: 'RootCauseCodes',
    },
    {
      value: 'Under / Over Payment',
      label: 'Under / Over Payment',
      type: 'RootCauseCodes',
    },
    {
      value: 'COB Issue',
      label: 'COB Issue',
      type: 'RootCauseCodes',
    },
    {
      value: 'Credentialing Issue',
      label: 'Credentialing Issue',
      type: 'RootCauseCodes',
    },
    {
      value: 'Not listed',
      label: 'Not listed',
      type: 'RootCauseCodes',
    },
  ]
  arScenario.insertMany(RootCauseCodes).then((getData) => {
    console.log(getData)
    res.json({
      data: getData,
      Result: true,
    })
  })
})

router.post('/statuscode', (req, res) => {
  StatusCode = [
    {
      value: '',
      label: 'Select',
      type: 'statuscode',
    },
    {
      value: 'CRE',
      label: 'CRE - Claim Rebilled Electronically',
      type: 'statuscode',
    },
    {
      value: 'CRF',
      label: 'CRF - Claim Rebilled Through Fax',
      type: 'statuscode',
    },
    {
      value: 'CRP',
      label: 'CRP - Claim Rebilled Through Paper',
      type: 'statuscode',
    },
    {
      value: 'CALL',
      label: 'CALL - Need to follow up with payer',
      type: 'statuscode',
    },
    {
      value: 'APS',
      label: 'APS - Appeal Sent',
      type: 'statuscode',
    },
    {
      value: 'CIP',
      label: 'CIP - Claim in Process',
      type: 'statuscode',
    },
    {
      value: 'STP',
      label: 'STP - Set to pay',
      type: 'statuscode',
    },
    {
      value: 'CPD',
      label: 'CPD - Claim Paid',
      type: 'statuscode',
    },
    {
      value: 'CPD-CC',
      label: 'CPD-CC - Claim paid thru Credit Card',
      type: 'statuscode',
    },
    {
      value: 'UN-TFL',
      label: 'UN-TFL - Untimely filing',
      type: 'statuscode',
    },
    {
      value: 'ASST',
      label: 'ASST - Need Assistance',
      type: 'statuscode',
    },
    {
      value: 'AC',
      label: 'AC - Account Closed - Payment posted already',
      type: 'statuscode',
    },
    {
      value: 'BP',
      label: 'BP - Bill Patient',
      type: 'statuscode',
    },
    {
      value: 'CRED',
      label: 'CRED - Credential Issue / Non Par Provider',
      type: 'statuscode',
    },
    {
      value: 'AUTH',
      label: 'AUTH - No Authorization  for procedure/# of visits exceeded.',
      type: 'statuscode',
    },
    {
      value: 'AUTH-OON',
      label: 'AUTH-OON - No Auth due to Non-PAR',
      type: 'statuscode',
    },
    {
      value: 'REFRL',
      label: 'REFRL - No Referral and all referral related Denials/# of visits exceeded.',
      type: 'statuscode',
    },
    {
      value: 'ADJ',
      label: 'ADJ - Adjusted',
      type: 'statuscode',
    },
    {
      value: 'NADJ',
      label: 'NADJ - Need to Adjust',
      type: 'statuscode',
    },
    {
      value: 'NWEB',
      label: 'NWEB - Need portal access / unable to get Claim value thru Call',
      type: 'statuscode',
    },
    {
      value: 'LMN',
      label: 'LMN - All not medical nessasity issues / Need LMN',
      type: 'statuscode',
    },
    {
      value: '2APPL',
      label: '2APPL - Second Level Appeal',
      type: 'statuscode',
    },
    {
      value: 'NT-APL',
      label: 'NT-APL - Need to Appeal',
      type: 'statuscode',
    },
    {
      value: 'AIP',
      label: 'AIP - Appeal in Process',
      type: 'statuscode',
    },
    {
      value: 'NMR',
      label: 'MR - need to send',
      type: 'statuscode',
    },
    {
      value: 'NADLIFO',
      label: 'NADLIFO - Additional information needed',
      type: 'statuscode',
    },
    {
      value: 'RRP',
      label: 'RRP - Return to Re-Process / Sent to reprocess',
      type: 'statuscode',
    },
    {
      value: 'NCRE',
      label: 'NCRE - Needed - Claim Rebill Electronically',
      type: 'statuscode',
    },
    {
      value: 'NCRF',
      label: 'NCRF - Needed - Claim Rebill Through Fax',
      type: 'statuscode',
    },
    {
      value: 'NCRP',
      label: 'NCRP - Needed - Claim Rebill Through Paper',
      type: 'statuscode',
    },
    {
      value: 'VM',
      label: 'VM - Voice Mail & Left message due to unable to reach payer',
      type: 'statuscode',
    },
    {
      value: 'NONW',
      label: 'NONW - Non-workable',
      type: 'statuscode',
    },
    {
      value: 'UNCOLL',
      label: 'UNCOLL - Un-Collectable',
      type: 'statuscode',
    },
    {
      value: 'Open',
      label: 'Open - Need to Work /review {Very first time entering into the tool}',
      type: 'statuscode',
    },
    {
      value: 'Fresh-Call',
      label: 'Fresh-Call - Need to Call Payer {Very first time}',
      type: 'statuscode',
    },
    {
      value: 'MRS',
      label: 'MRS - Medical records Sent',
      type: 'statuscode',
    },
    {
      value: 'MIP',
      label: 'MIP - Medical records in Process',
      type: 'statuscode',
    },
    {
      value: 'CAP',
      label: 'CAP - Capitation claims',
      type: 'statuscode',
    },
    {
      value: 'RECALL',
      label: 'RECALL - Updated additional info/incorrect call notes, Need to call again',
      type: 'statuscode',
    },
    {
      value: 'CHARITY',
      label: 'CHARITY - Charity claims',
      type: 'statuscode',
    },
    {
      value: 'DDE',
      label: 'DDE - Claim submitted thru direct data entry',
      type: 'statuscode',
    },
    {
      value: 'COB',
      label: 'COB - Patient need to update COB with payer.',
      type: 'statuscode',
    },
    {
      value: 'BAKPTD',
      label: 'BAKPTD - Insurance Bankrupted',
      type: 'statuscode',
    },
    {
      value: 'RECBILL',
      label: 'RECBILL - Old charges received and billed recently',
      type: 'statuscode',
    },
    {
      value: 'RE-OPEN',
      label: 'RE-OPEN - Medicare claims reopened in webportal',
      type: 'statuscode',
    },
    {
      value: 'CPAT',
      label:
        'CPAT - Need to contact patient for additional information like COB issue, Account deliquency, premium issues',
      type: 'statuscode',
    },
    {
      value: 'BUND',
      label:
        'BUND - Either Adjust or add appropriate modifer and rebill for bundled service or Global period services.',
      type: 'statuscode',
    },
    {
      value: 'DX',
      label: 'DX - Dx issues',
      type: 'statuscode',
    },
    {
      value: 'MUE EXD',
      label: 'MUE EXD - Services billed more than the Allowable units by Medicare for the day.',
      type: 'statuscode',
    },
    {
      value: 'COD - ASST',
      label: 'COD - ASST - Coding Assistance - CPT, ICD -10, Modifier',
      type: 'statuscode',
    },
    {
      value: 'DEL-SIGN',
      label: 'DEL-SIGN - Delayed Signature from Practice end',
      type: 'statuscode',
    },
    {
      value: 'PEOB ST',
      label: 'PEOB ST - PEOB Sent',
      type: 'statuscode',
    },
    {
      value: 'EMAIL',
      label:
        'EMAIL - Sent email to Caller or client for clarification or other updates(differ from general call )',
      type: 'statuscode',
    },
    {
      value: 'HOLD',
      label: 'HOLD - Claim kept in hold value for clarifications',
      type: 'statuscode',
    },
  ]
  arScenario.insertMany(StatusCode).then((getData) => {
    console.log(getData)
    res.json({
      data: getData,
      Result: true,
    })
  })
})

router.get('/arscenario', (req, res) => {
  arScenario.find({ type: { $in: ['ArScenario'] } }).then((getData) => {
    res.json({
      data: getData,
    })
  })
})
router.get('/denialcodes', (req, res) => {
  arScenario.find({ type: { $in: ['DenialCode'] } }).then((getData) => {
    res.json({
      data: getData,
    })
  })
})

router.get('/rootcause', (req, res) => {
  arScenario.find({ type: { $in: ['RootCauseCodes'] } }).then((getData) => {
    res.json({
      data: getData,
    })
  })
})

router.get('/status', (req, res) => {
  arScenario.find({ type: { $in: ['statuscode'] } }).then((getData) => {
    res.json({
      data: getData,
    })
  })
})


router.post('/lookup', async (req, res, next) => {
  const root = req.body.root;
  const description = req.body.description;
  const label = req.body.label;
  const filter = await arScenario.find({ type: root,value: label })

  if (!filter.length) {

    const addscenario = await new arScenario({ type: root, label: description, value: label })
    addscenario.save()
    return res.json({
      Message: "Added Successfully...!",
      Result: true
    })

  } else {
    return res.json({
      Message: root == "RootCauseCodes" ? `Root Cause ${label} Already exists` : `Status Code ${label} Already exists`,
      Result: true
    })
  }

})

router.get('/filtertable', async (req, res, next) => {
  const filter = req.query.keyword
  if (filter === 'statuscode') {
    const data = await arScenario.find({ "type": "statuscode" }).select(["-__v", "-type",])
    return res.json({
      data: data,
      toggle: filter
    })
  }
  if (filter === 'RootCauseCodes') {
    const data = await arScenario.find({ "type": "RootCauseCodes" }).select(["-__v", "-type",])

    return res.json({
      data: data,
      toggle: filter
    })
  }
})
module.exports = router
