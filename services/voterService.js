const Voter = require('../db/models/voter');
const Member = require('../db/models/member');

exports.getVoters = async (electionId, filters = {}, options = {}) => {
    try {
        let query = {
            election: electionId,
        };

        // Direkt olarak Voter modeli üzerinde filtreleme yapılan alanlar:
        if (filters.hasVoted !== undefined) {
            query.hasVoted = filters.hasVoted;
        }

        // Member modeli ile ilişkilendirilmiş alanlar üzerinde filtreleme:
        const populateQuery = {
            path: 'member',
            select: ['name', 'surname', 'country', 'city']
        };

        if (filters.country) {
            populateQuery.match = { country: filters.country };
        }

        if (filters.city) {
            populateQuery.match = { ...populateQuery.match, city: filters.city };
        }

        if (filters.name) {
            populateQuery.match = { ...populateQuery.match, name: new RegExp(filters.name, 'i') };
        }

        if (filters.surname) {
            populateQuery.match = { ...populateQuery.match, surname: new RegExp(filters.surname, 'i') };
        }

        const voters = await Voter.paginate(query, {
            ...options,
            populate: populateQuery
        });

        return voters;
    } catch (error) {
        throw error;
    }
};
