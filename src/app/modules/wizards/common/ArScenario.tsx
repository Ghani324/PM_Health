const  arscenario = [
    {
        "value": "",
        "label": "Select"
    },
    {
        "value": "1.html",
        "label": "No Claim on File"
    },
    {
        "value": "claim-in-process-1.html",
        "label": "Claim in process"
    },
    {
        "value": "approved-to-pay.html",
        "label": "Claim is approved to pay"
    },
    {
        "value": "claim-paid.html",
        "label": "Claim paid"
    },
    {
        "value": "claim-paid-and-applied-towards-offset.html",
        "label": "Claim paid & applied towards offset"
    },
    {
        "value": "100-payment-made-to-patientinsuredrespo.html",
        "label": "Claim paid to patient"
    },
    {
        "value": "blog-post.html",
        "label": "Claim applied towards Deductible"
    },
    {
        "value": "31-patient-cannot-be-identified-as-our.html",
        "label": "Claim denied as patient cannot be identified"
    },
    {
        "value": "26-expenses-incurred-prior-to.html",
        "label": "Claim denied as Coverage Terminated"
    },
    {
        "value": "29-time-limit-for-filing-has-expired.html",
        "label": "Claim denied as the time limit for filing has expired"
    },
    {
        "value": "197-precertificationauthorizationnotifi.html",
        "label": "Claim denied as authorization absent or missing"
    },
    {
        "value": "288-referral-absent.html",
        "label": "Claim denied as referral is absent or missing"
    },
    {
        "value": "119-benefit-maximum-for-this-time_28.html",
        "label": "Claim denied as maximum benefit exhausted/reached"
    },
    {
        "value": "96-non-covered-charges.html",
        "label": "Claim denied as non covered charges"
    },
    {
        "value": "96-non-covered-charges-provider-is-out.html",
        "label": "Claim denied as non covered charges as provider is out of network"
    },
    {
        "value": "227-information-requested-from.html",
        "label": "Claim denied as additional information requested from patient"
    },
    {
        "value": "16-claimservice-lacks-information-or.html",
        "label": "Claim denied as additional information requested from provider"
    },
    {
        "value": "226-information-requested-from.html",
        "label": "Claim denied as medical records requested"
    },
    {
        "value": "18-exact-duplicate-claimservice.html",
        "label": "Claim denied as Duplicate"
    },
    {
        "value": "b9-patient-is-enrolled-in-hospice.html",
        "label": "Claim denied as patient enrolled in hospice"
    },
    {
        "value": "4-procedure-code-inconsistent-with.html",
        "label": "Claim denied as procedure code inconsistent with the modifier used"
    },
    {
        "value": "182-procedure-modifier-was-invalid-on.html",
        "label": "Claim denied for invalid modifier on date of service"
    },
    {
        "value": "11-diagnosis-is-inconsistent-with.html",
        "label": "Claim denied as diagnosis code is inconsistent with the procedure"
    },
    {
        "value": "146-diagnosis-was-invalid-for-dates-of.html",
        "label": "Claim denied as diagnosis code is invalid for date of service"
    },
    {
        "value": "181-procedure-code-was-invalid-on-date.html",
        "label": "Claim denied as Procedure code was invalid on the date of service"
    },
    {
        "value": "183-referring-provider-is-not-eligible.html",
        "label": "Claim denied as referring provider is not eligible to refer the service billed"
    },
    {
        "value": "163-attachmentother-documentation.html",
        "label": "Claim denied for primary EOB"
    },
    {
        "value": "22-this-care-may-be-covered-by-another.html",
        "label": "Claim denied as other payer is primary"
    },
    {
        "value": "ma04-secondary-payment-cannot-be.html",
        "label": "Claim denied as Secondary payment cannot be considered without the identity of or payment information from the primary payer"
    },
    {
        "value": "109-claimservice-not-covered-by-this.html",
        "label": "Claim denied as claim not covered by this payer"
    },
    {
        "value": "24-charges-are-covered-under-capitation.html",
        "label": "Claim paid directly to provider under Capitation contract/Claim denied as patient covered under capitation or managed care plan"
    },
    {
        "value": "58-treatment-was-deemed-by-payer-to.html",
        "label": "Claim denied for invalid place of service"
    },
    {
        "value": "23-impact-of-prior-payers-adjudication.html",
        "label": "Claim denied as primary paid more than secondary allowed amount"
    },
    {
        "value": "50-these-are-non-covered-services.html",
        "label": "Claim denied as medically not necessity"
    },
    {
        "value": "19-this-is-work-related-injuryillness.html",
        "label": "Claim denied as This is a work-related injury/illness and thus the liability of the Worker's Compensation Carrier"
    },
    {
        "value": "20-this-injuryillness-is-covered-by.html",
        "label": "Claim denied as This injury/illness is covered by the liability carrier"
    },
    {
        "value": "21-this-injuryillness-is-liability-of.html",
        "label": "Claim denied as This injury/illness is the liability of the no-fault carrier/Auto insurance"
    },
    {
        "value": "97-benefit-for-this-service-is-included.html",
        "label": "Claim denied as Bundle/Inclusive"
    },
    {
        "value": "globally-inclusive-to-surgery_97.html",
        "label": "Claim denied as Globally inclusive to Surgery"
    },
    {
        "value": "236-this-procedure-or-proceduremodifier.html",
        "label": "Claim denied as procedure combination is not compatible with another procedure"
    },
    {
        "value": "234-this-procedure-is-not-paid.html",
        "label": "Claim denied as procedure code is not paid separately"
    },
    {
        "value": "185-rendering-provider-is-not-eligible.html",
        "label": "Claim denied as rendering provider is not eligible to perform the service billed"
    },
    {
        "value": "8-procedure-code-is-inconsistent-with.html",
        "label": "Claim denied as the procedure code is inconsistent with provider type/specialty"
    },
    {
        "value": "49-this-is-non-covered-service-because_19.html",
        "label": "Claim denied as routine services not covered"
    },
    {
        "value": "this-provider-was-not-certifiedeligible.html",
        "label": "Claim denied as This provider was not certified/eligible to be paid for this procedure/service on this date of service"
    },
    {
        "value": "51-these-are-non-covered-services.html",
        "label": "Claim denied as pre-existing condition not covered"
    },
    {
        "value": "7-procedurerevenue-code-is-inconsistent.html",
        "label": "Claim denied as Procedure code is inconsistent with patient's gender"
    },
    {
        "value": "6-procedurerevenue-code-is-inconsistent.html",
        "label": "Claim denied as Procedure code is inconsistent with patient's age"
    },
    {
        "value": "10-diagnosis-is-inconsistent-with.html",
        "label": "Claim denied as diagnosis code is inconsistent with patient's gender"
    },
    {
        "value": "9-diagnosis-is-inconsistent-with.html",
        "label": "Claim denied as diagnosis code is inconsistent with patient's age"
        
    },
    {
        "value": "m119missingincompleteinvalid.html",
        "label": "Claim denied for invalid or missing NDC Code"
    },
    {
        "value": "ma120missingincompleteinvalid-clia.html",
        "label": "Claim denied for invalid or missing CLIA Number"
    },
    {
        "value": "new-patient-established-patient-codes.html",
        "label": "Claim denied for New patient/Established patient criteria not met"
    },
    {
        "value": "how-to-work-on-denial-129-prior.html",
        "label": "Claim denied as Prior processing information appears incorrect"
    },
    {
        "value": "151-payment-adjusted-because-payer.html",
        "label": "Claim denied as CPT has reached the maximum allowance for a specific time period"
    },
    {
        "value": "13-date-of-death-precedes-date-of.html",
        "label": "Claim denied as the date of death precedes the date of service"
    },
    {
        "value": "55-proceduretreatmentdrug-is-deemed.html",
        "label": "Claim denied as Procedure/treatment/drug is deemed experimental/investigational by the payer"
    },
    {
        "value": "199-revenue-code-and-procedure-code-do.html",
        "label": "Claim denied as Revenue code and Procedure code do not match"
    }
    

    

]
export {arscenario} 