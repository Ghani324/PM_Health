export interface AuthModel {
  id: string,
  _id: string
  token : string,
  api_token: string
  refreshToken?: string
}

export interface UserAddressModel {
  addressLine: string
  city: string
  state: string
  postCode: string
}

export interface UserCommunicationModel {
  email: boolean
  sms: boolean
  phone: boolean
}

export interface UserEmailSettingsModel {
  emailNotification?: boolean
  sendCopyToPersonalEmail?: boolean
  activityRelatesEmail?: {
    youHaveNewNotifications?: boolean
    youAreSentADirectMessage?: boolean
    someoneAddsYouAsAsAConnection?: boolean
    uponNewOrder?: boolean
    newMembershipApproval?: boolean
    memberRegistration?: boolean
  }
  updatesFromKeenthemes?: {
    newsAboutKeenthemesProductsAndFeatureUpdates?: boolean
    tipsOnGettingMoreOutOfKeen?: boolean
    thingsYouMissedSindeYouLastLoggedIntoKeen?: boolean
    newsAboutStartOnPartnerProductsAndOtherServices?: boolean
    tipsOnStartBusinessProducts?: boolean
  }
}

export interface UserSocialNetworksModel {
  linkedIn: string
  facebook: string
  twitter: string
  instagram: string
}

export interface UserModel {
  token: string,
  api_token : string,
  UserName: string,
  EmployeeId: string,
  Prefix: string,
  FirstName: string,
  LastName: string,
  EmailId: string,
  Password: string,
  Status: string,
  CreatedBy: string,
  UpdatedBy: string,
  ReportingManagerId: string,
  PracticeId: string,
  Role:string,
  PmId: string
  _id : string,
  RoleType : string,
  RoleName : string,
  PermissionsList: any,
  id: string
}
