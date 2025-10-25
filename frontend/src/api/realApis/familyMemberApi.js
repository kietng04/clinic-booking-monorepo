import { createApiClient } from '../core/createApiClient'

/**
 * Family Members API - Real backend integration
 * Manages family member records for patients
 */

const familyMemberServiceClient = createApiClient()

export const familyMemberApi = {
  /**
   * Get family members for a user
   * @param {string} userId - User ID (primary account holder)
   * @returns {Promise} Array of family members
   */
  getMembers: async (userId) => {
    const response = await familyMemberServiceClient.get(`/api/family-members/user/${userId}`)
    return response.data.content || response.data
  },

  /**
   * Add a new family member
   * @param {Object} memberData - Family member information
   * @param {string} memberData.userId - Primary user ID
   * @param {string} memberData.name - Member name
   * @param {string} memberData.relationship - Relationship to primary user (SPOUSE | CHILD | PARENT | SIBLING | OTHER)
   * @param {string} memberData.dateOfBirth - Date of birth (YYYY-MM-DD)
   * @param {string} memberData.gender - Gender (MALE | FEMALE | OTHER)
   * @param {string} memberData.email - Email address (optional)
   * @param {string} memberData.phoneNumber - Phone number (optional)
   * @returns {Promise} Created family member
   */
  addMember: async (memberData) => {
    const response = await familyMemberServiceClient.post('/api/family-members', memberData)
    return response.data
  },

  /**
   * Update family member information
   * @param {string} id - Family member ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} Updated family member
   */
  updateMember: async (id, updates) => {
    const response = await familyMemberServiceClient.put(`/api/family-members/${id}`, updates)
    return response.data
  },

  /**
   * Delete a family member
   * @param {string} id - Family member ID
   * @returns {Promise} Success response
   */
  deleteMember: async (id) => {
    const response = await familyMemberServiceClient.delete(`/api/family-members/${id}`)
    return response.data
  },
}

export default familyMemberApi
