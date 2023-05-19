const  denialCode = [
    {
        "value": "",
        "label": "Select"
    },
    {
    "value": "blog-post.html",
    "label": "1: Deductible Amount"
   },
   {
    "value": "4_procedure_code_inconsistent_with.html",
    "label": "4: The procedure code inconsistent with the modifier used or a required modifier is missing"
   },
   {
    "value": "5-procedure-codetype-of-bill-is.html",
    "label": "5: The procedure code/type of bill is inconsistent with the place of service"
   },
   {
    "value": "6-procedurerevenue-code-is-inconsistent.html",
    "label": "6: The procedure/revenue code is inconsistent with the patient's age"
   },
   {
    "value": "7-procedurerevenue-code-is-inconsistent.html",
    "label": "7: The procedure/revenue code is inconsistent with the patient's gender"
   },
   {
    "value": "8-procedure-code-is-inconsistent-with.html",
    "label": "8: The procedure code is inconsistent with the provider type/specialty (taxonomy)"
   },
   {
    "value": "9-diagnosis-is-inconsistent-with.html",
    "label": "9: The diagnosis is inconsistent with the patient's age"
   },
   {
    "value": "10-diagnosis-is-inconsistent-with.html",
    "label": "10: The diagnosis is inconsistent with the patient's gender"
   },
   {
    "value": "11-diagnosis-is-inconsistent-with.html",
    "label": "11: The diagnosis is inconsistent with the procedure"
   },
   {
    "value": "13-date-of-death-precedes-date-of.html",
    "label": "13: The date of death precedes the date of service"
   },
   {
    "value": "16-claimservice-lacks-information-or.html",
    "label": "16: Claim/service lacks information or has submission/billing error(s)"
   },
   {
    "value": "18-exact-duplicate-claimservice.html",
    "label": "18: Exact duplicate claim/service"
   },
   {
    "value": "19-this-is-work-related-injuryillness.html",
    "label": "19: This is a work-related injury/illness and thus the liability of the Worker's Compensation Carrier"
   },
   {
    "value": "20-this-injuryillness-is-covered-by.html",
    "label": "20: This injury/illness is covered by the liability carrier"
   },
   {
    "value": "21-this-injuryillness-is-liability-of.html",
    "label": "21: This injury/illness is the liability of the no-fault carrier"
   },
   {
    "value": "22-this-care-may-be-covered-by-another.html",
    "label": "22: This care may be covered by another payer per coordination of benefits"
   },
   {
    "value": "23-impact-of-prior-payers-adjudication.html",
    "label": "23: The impact of prior payer(s) adjudication including payments and/or adjustment"
   },
   {
    "value": "24-charges-are-covered-under-capitation.html",
    "label": "24: Charges are covered under a capitation agreement/managed care plan"
   },
   {
    "value": "26-expenses-incurred-prior-to.html",
    "label": "26: Expenses incurred prior to coverage"
   },
   {
    "value": "26-expenses-incurred-prior-to.html",
    "label": "27: Expenses incurred after coverage terminated"
   },
   {
    "value": "29-time-limit-for-filing-has-expired.html",
    "label": "29: The time limit for filing has expired"
   },
   {
    "value": "31-patient-cannot-be-identified-as-our.html",
    "label": "31: Patient cannot be identified as our insured"
   },
   {
    "value": "49-this-is-non-covered-service-because_19.html",
    "label": "49: This is a non-covered service because it is a routine/preventive exam or a diagnostic/screening procedure done in conjunction with a routine/preventive exam"
   },
   {
    "value": "50-these-are-non-covered-services.html",
    "label": "50: These are non-covered services because this is not deemed a 'medical necessity' by the payer"
   },
   {
    "value": "51-these-are-non-covered-services.html",
    "label": "51: These are non-covered services because this is a pre-existing condition"
   },
   {
    "value": "55-proceduretreatmentdrug-is-deemed.html",
    "label": "55: Procedure/treatment/drug is deemed experimental/investigational by the payer"
   },

   {
    "value": "58-treatment-was-deemed-by-payer-to.html",
    "label": "58: Treatment was deemed by the payer to have been rendered in an inappropriate or invalid place of service"
   },

   {
    "value": "96-non-covered-charges.html",
    "label": "96: Non-Covered Charges"
   },

   {
    "value": "97-benefit-for-this-service-is-included.html",
    "label": "97: The benefit for this service is included in the payment/allowance for another service/procedure that has already been adjudicated"
   },

   {
    "value": "100-payment-made-to-patientinsuredrespo.html",
    "label": "100: Payment made to Patient/Insured/Responsible party"
   },

   {
    "value": "109-claimservice-not-covered-by-this.html",
    "label": "109: Claim/service not covered by this payer/contractor. You must send the claim/service to the correct payer/contractor"
   },

   {
    "value": "119-benefit-maximum-for-this-time_28.html",
    "label": "119: Benefit Maximum for this time period or occurrence has been reached"
   },

   {
    "value": "how-to-work-on-denial-129-prior.html",
    "label": "129: Prior processing information appears incorrect"
   },

   {
    "value": "140-patientinsured-health.html",
    "label": "140: Patient/Insured health identification number and name do not match"
   },
   {
    "value": "146-diagnosis-was-invalid-for-dates-of.html",
    "label": "146: Diagnosis was invalid for the date(s) of service reported"
   },
   {
    "value": "151-payment-adjusted-because-payer.html",
    "label": "151: Payment adjusted because the payer deems the information submitted does not support this many/frequency of services"
   },
   {
    "value": "163-attachmentother-documentation.html",
    "label": "163: Attachment/other documentation referenced on the claim was not received"
   },
   {
    "value": "181-procedure-code-was-invalid-on-date.html",
    "label": "181: Procedure code was invalid on the date of service"
   },
   {
    "value": "182-procedure-modifier-was-invalid-on.html",
    "label": "182: Procedure modifier was invalid on the date of service"
   },
   {
    "value": "183-referring-provider-is-not-eligible.html",
    "label": "183: The referring provider is not eligible to refer the service billed"
   },
   {
    "value": "185-rendering-provider-is-not-eligible.html",
    "label": "185: The rendering provider is not eligible to perform the service billed"
   },
   {
    "value": "197-precertificationauthorizationnotifi.html",
    "label": "197: Precertification/Authorization/Notification/Pre-treatment absent"
   },
   {
    "value": "199-revenue-code-and-procedure-code-do.html",
    "label": "199: Revenue code and Procedure code do not match"
   },
   {
    "value": "226-information-requested-from.html",
    "label": "226: Information requested from the Billing/Rendering Provider was not provided or not provided timely or was insufficient/incomplete"
   },
   {
    "value": "227-information-requested-from.html",
    "label": "227: Information requested from the patient/insured/responsible party was not provided or was insufficient/incomplete"
   },
   {
    "value": "234-this-procedure-is-not-paid.html",
    "label": "234: This procedure is not paid separately"
   },
   {
    "value": "236-this-procedure-or-proceduremodifier.html",
    "label": "236: This procedure or procedure/modifier combination is not compatible with another procedure or procedure/modifier combination provided on the same day according to the National Correct Coding Initiative or workers compensation state regulations/ fee schedule requirements"
   },
   {
    "value": "96-non-covered-charges-provider-is-out.html",
    "label": "242: Services not provided by network/primary care providers"
   },
   {
    "value": "288-referral-absent.html",
    "label": "288: Referral absent"
   },
   {
    "value": "ma04-secondary-payment-cannot-be.html",
    "label": "MA04: Secondary payment cannot be considered without the identity of or payment information from the primary payer. The information was either not reported or was illegible"
   },
   {
    "value": "this-provider-was-not-certifiedeligible.html",
    "label": "B7: This provider was not certified/eligible to be paid for this procedure/service on this date of service"
   },
   {
    "value": "b9-patient-is-enrolled-in-hospice.html",
    "label": "B9: Patient is enrolled in a Hospice"
   },
   {
    "value": "m119missingincompleteinvalid.html",
    "label": "M119: Missing/incomplete/invalid/ deactivated/withdrawn National Drug Code (NDC)"
   },
   {
    "value": "ma120missingincompleteinvalid-clia.html",
    "label": "MA120: Missing/incomplete/invalid CLIA certification number"
   }


]
export {denialCode} 


