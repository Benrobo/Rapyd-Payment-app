import { BASE_URL } from ".";

const API_ROUTES = {
  login: `${BASE_URL}/auth/login`,
  register: `${BASE_URL}/auth/register`,
  createWallet: `${BASE_URL}/wallet/create`,
  withdraw: `${BASE_URL}/wallet/withdraw`,
  getWalletInfo: `${BASE_URL}/wallet/get`,
  getIdentityTypes: `${BASE_URL}/wallet/identityTypes`,
  verifyWalletIdentity: `${BASE_URL}/wallet/verify`,
  issueIban: `${BASE_URL}/wallet/issue/iban`,
  makePayment: `${BASE_URL}/wallet/addFund`,
  createLink: `${BASE_URL}/payment/link/create`,
  getAllLinks: `${BASE_URL}/payment/link/allLinks`,
  getLinkById: `${BASE_URL}/payment/link`,
  disableLink: `${BASE_URL}/payment/link/disable`,
  deleteLink: `${BASE_URL}/payment/link/delete`,
  getWalletTransactions: `${BASE_URL}/transaction/all`,
  getWalletTransactionById: `${BASE_URL}/transaction/`,
};

export default API_ROUTES;
