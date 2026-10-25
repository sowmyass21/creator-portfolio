/**
 * Resume Profile Version Comparison & Diff Engine
 * Compares current user profile with newly parsed resume profile.
 * Identifies ADDED, UPDATED, and REMOVED items.
 */
export function compareProfiles(currentProfile = {}, newProfile = {}) {
  const added = [];
  const updated = [];
  const removed = [];

  const currentPersonal = currentProfile.personal_information || {};
  const newPersonal = newProfile.personal_information || {};

  // 1. Personal Information Updates
  const personalFields = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'professional_title', label: 'Professional Title' },
    { key: 'email', label: 'Email Address' },
    { key: 'phone', label: 'Phone Number' },
    { key: 'location', label: 'Location' },
    { key: 'website', label: 'Website' },
    { key: 'github', label: 'GitHub Profile' },
    { key: 'linkedin', label: 'LinkedIn Profile' },
  ];

  personalFields.forEach(field => {
    const oldVal = currentPersonal[field.key];
    const newVal = newPersonal[field.key];

    if (!oldVal && newVal) {
      added.push({
        section: 'personal',
        field: field.key,
        title: `Added ${field.label}: ${newVal}`,
        value: newVal,
      });
    } else if (oldVal && newVal && oldVal.trim().toLowerCase() !== newVal.trim().toLowerCase()) {
      updated.push({
        section: 'personal',
        field: field.key,
        title: `${field.label} updated`,
        from: oldVal,
        to: newVal,
      });
    } else if (oldVal && !newVal) {
      removed.push({
        section: 'personal',
        field: field.key,
        title: `Removed ${field.label}: ${oldVal}`,
        value: oldVal,
      });
    }
  });

  // 2. Summary
  const currentSummary = currentProfile.summary?.professional_summary || '';
  const newSummary = newProfile.summary?.professional_summary || '';
  if (!currentSummary && newSummary) {
    added.push({
      section: 'summary',
      field: 'professional_summary',
      title: 'Added Professional Summary',
      value: newSummary,
    });
  } else if (currentSummary && newSummary && currentSummary.trim() !== newSummary.trim()) {
    updated.push({
      section: 'summary',
      field: 'professional_summary',
      title: 'Professional Summary updated',
      from: currentSummary,
      to: newSummary,
    });
  }

  // 3. Projects Comparison
  const currentProjects = Array.isArray(currentProfile.projects) ? currentProfile.projects : [];
  const newProjects = Array.isArray(newProfile.projects) ? newProfile.projects : [];

  newProjects.forEach(np => {
    const matching = currentProjects.find(cp => 
      (cp.name && np.name && cp.name.trim().toLowerCase() === np.name.trim().toLowerCase()) ||
      (cp.title && np.title && cp.title.trim().toLowerCase() === np.title.trim().toLowerCase())
    );

    if (!matching) {
      added.push({
        section: 'projects',
        title: `New Project: ${np.name || np.title || 'Untitled Project'}`,
        item: np,
      });
    } else {
      // Check if description or role changed
      if (np.description && matching.description && np.description.trim() !== matching.description.trim()) {
        updated.push({
          section: 'projects',
          title: `Project '${np.name || np.title}' description updated`,
          from: matching.description,
          to: np.description,
          item: np,
        });
      }
    }
  });

  currentProjects.forEach(cp => {
    const matching = newProjects.find(np => 
      (cp.name && np.name && cp.name.trim().toLowerCase() === np.name.trim().toLowerCase()) ||
      (cp.title && np.title && cp.title.trim().toLowerCase() === np.title.trim().toLowerCase())
    );

    if (!matching) {
      removed.push({
        section: 'projects',
        title: `Removed Project: ${cp.name || cp.title || 'Untitled Project'}`,
        item: cp,
      });
    }
  });

  // 4. Work Experience Comparison
  const currentExp = Array.isArray(currentProfile.experience) ? currentProfile.experience : [];
  const newExp = Array.isArray(newProfile.experience) ? newProfile.experience : [];

  newExp.forEach(ne => {
    const matching = currentExp.find(ce => 
      ce.company && ne.company && ce.company.trim().toLowerCase() === ne.company.trim().toLowerCase()
    );

    if (!matching) {
      added.push({
        section: 'experience',
        title: `New Work Experience: ${ne.job_title || ne.title || 'Role'} at ${ne.company}`,
        item: ne,
      });
    } else if (ne.job_title && matching.job_title && ne.job_title.trim() !== matching.job_title.trim()) {
      updated.push({
        section: 'experience',
        title: `Job Title at ${ne.company} updated`,
        from: matching.job_title,
        to: ne.job_title,
        item: ne,
      });
    }
  });

  currentExp.forEach(ce => {
    const matching = newExp.find(ne => 
      ce.company && ne.company && ce.company.trim().toLowerCase() === ne.company.trim().toLowerCase()
    );

    if (!matching) {
      removed.push({
        section: 'experience',
        title: `Removed Experience at ${ce.company}`,
        item: ce,
      });
    }
  });

  // 5. Skills Comparison
  const extractSkills = (prof) => {
    const skillsObj = prof.skills || {};
    let all = [];
    if (Array.isArray(skillsObj)) {
      skillsObj.forEach(s => {
        if (typeof s === 'string') all.push(s);
        else if (Array.isArray(s.items)) all.push(...s.items);
      });
    } else if (typeof skillsObj === 'object') {
      Object.values(skillsObj).forEach(val => {
        if (Array.isArray(val)) all.push(...val);
      });
    }
    return [...new Set(all.map(s => String(s).trim()))];
  };

  const currentSkillList = extractSkills(currentProfile);
  const newSkillList = extractSkills(newProfile);

  newSkillList.forEach(s => {
    if (!currentSkillList.some(cs => cs.toLowerCase() === s.toLowerCase())) {
      added.push({
        section: 'skills',
        title: `New Skill: ${s}`,
        item: s,
      });
    }
  });

  currentSkillList.forEach(cs => {
    if (!newSkillList.some(ns => ns.toLowerCase() === cs.toLowerCase())) {
      removed.push({
        section: 'skills',
        title: `Removed Skill: ${cs}`,
        item: cs,
      });
    }
  });

  // 6. Certifications Comparison
  const currentCerts = Array.isArray(currentProfile.certifications) ? currentProfile.certifications : [];
  const newCerts = Array.isArray(newProfile.certifications) ? newProfile.certifications : [];

  newCerts.forEach(nc => {
    const ncName = typeof nc === 'string' ? nc : (nc.name || nc.title);
    const matching = currentCerts.find(cc => {
      const ccName = typeof cc === 'string' ? cc : (cc.name || cc.title);
      return ccName && ncName && ccName.trim().toLowerCase() === ncName.trim().toLowerCase();
    });

    if (!matching && ncName) {
      added.push({
        section: 'certifications',
        title: `New Certification: ${ncName}`,
        item: nc,
      });
    }
  });

  currentCerts.forEach(cc => {
    const ccName = typeof cc === 'string' ? cc : (cc.name || cc.title);
    const matching = newCerts.find(nc => {
      const ncName = typeof nc === 'string' ? nc : (nc.name || nc.title);
      return ccName && ncName && ccName.trim().toLowerCase() === ncName.trim().toLowerCase();
    });

    if (!matching && ccName) {
      removed.push({
        section: 'certifications',
        title: `Removed Certification: ${ccName}`,
        item: cc,
      });
    }
  });

  return {
    hasChanges: added.length > 0 || updated.length > 0 || removed.length > 0,
    summary: {
      addedCount: added.length,
      updatedCount: updated.length,
      removedCount: removed.length,
    },
    changes: {
      added,
      updated,
      removed,
    },
  };
}

export default {
  compareProfiles,
};
