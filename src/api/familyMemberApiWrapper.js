import { familyMemberApi as realFamilyMemberApi } from './realApis/familyMemberApi'
import { familyMemberApi as mockFamilyMemberApi } from './mockApi'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND === 'true'

const api = USE_MOCK_BACKEND ? mockFamilyMemberApi : realFamilyMemberApi

export const familyMemberApi = USE_MOCK_BACKEND
  ? {
      getMembers: (userId) => api.getFamilyMembers(userId),
      addMember: (data) => api.addFamilyMember(data),
      updateMember: (id, data) => api.updateFamilyMember(id, data),
      deleteMember: (id) => api.deleteFamilyMember(id),
    }
  : api

console.log(
  `👨‍👩‍👧‍👦 Family Member Backend: ${USE_MOCK_BACKEND ? 'MOCK (Demo Mode)' : 'REAL (Production)'}`
)

export default familyMemberApi
