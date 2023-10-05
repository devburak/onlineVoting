const Voter = require('../db/models/voter');
const Member = require('../db/models/member');
const Election = require('../db/models/election');

exports.getVoters = async (electionId, filters = {}, options = {}) => {
    try {
        let query = { election: electionId };
        let memberQuery = {};

        // Direkt olarak Voter modeli üzerinde filtreleme yapılan alanlar:
        if (filters.hasVoted !== undefined) {
            query.hasVoted = filters.hasVoted;
        }

        // Member modeli üzerinde filtreleme yapılan alanlar:
        if (filters.country) {
            memberQuery.country = new RegExp(filters.country, 'i');
        }

        if (filters.city) {
            memberQuery.city = new RegExp(filters.city, 'i');
        }

        if (filters.name) {
            memberQuery.name = new RegExp(filters.name, 'i');
        }

        if (filters.surname) {
            memberQuery.surname = new RegExp(filters.surname, 'i');
        }

        // 1. Aşama: Member sorgulaması ve ilgili ID'lerin alınması
        const memberIds = await Member.find(memberQuery).select('_id');
        
        // Eğer üye bulunamazsa, hiçbir seçmen verisi olmayacağından doğrudan boş bir sonuç döndürülebilir
        if (memberIds.length === 0) {
            return { docs: [], totalDocs: 0, limit: options.limit || 0, page: options.page || 1, totalPages: 0, nextPage: null, prevPage: null };
        }
        
        // 2. Aşama: Voter sorgulaması, bu sefer üye ID'lerine göre
        query.member = { $in: memberIds.map(m => m._id) };
        
        const voters = await Voter.paginate(query, {
            ...options,
            populate: {
                path: 'member',
                select: ['name', 'surname', 'country', 'city']
            }
        });
        
        return voters;
    } catch (error) {
        throw error;
    }
};