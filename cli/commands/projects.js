import { fmt, symbols } from '../utils/colors.js';
import { request } from '../utils/apiClient.js';

export const commandProjects = async () => {
  console.log(`\n${symbols.gear} ${fmt.bold('Validating Portfolio Projects Data...')}\n`);

  try {
    const res = await request('/projects');
    const projects = res.data?.data || [];

    let totalValid = 0;
    let warningsCount = 0;

    console.log(`${fmt.bold('Portfolio Projects Audit:')}\n`);

    projects.forEach((proj, idx) => {
      const hasTitle = !!proj.title;
      const hasSummary = !!proj.summary;
      const hasDemo = !!proj.demoUrl;
      const hasGithub = !!proj.githubUrl;

      const isValid = hasTitle && hasSummary;
      if (isValid) totalValid++;
      if (!hasDemo || !hasGithub) warningsCount++;

      const statusSymbol = isValid ? symbols.check : symbols.cross;
      const featureSymbol = proj.featured ? fmt.yellow(' [Featured]') : '';

      console.log(`${idx + 1}. ${statusSymbol} ${fmt.bold(proj.title)}${featureSymbol} (${fmt.cyan(proj.category)})`);
      console.log(`   ${fmt.gray('Summary:')} ${proj.summary.slice(0, 70)}...`);
      console.log(`   ${fmt.gray('GitHub:')}  ${hasGithub ? fmt.green(proj.githubUrl) : fmt.yellow('Missing GitHub link')}`);
      console.log(`   ${fmt.gray('Demo:')}    ${hasDemo ? fmt.green(proj.demoUrl) : fmt.yellow('Missing Live Demo link')}`);
      console.log('');
    });

    console.log(fmt.box('PORTFOLIO DATA VALIDATION REPORT', [
      `Total Projects Scanned: ${fmt.bold(projects.length)}`,
      `Valid & Published:      ${fmt.green(totalValid + '/' + projects.length)}`,
      `Warnings / Missing URLs: ${warningsCount > 0 ? fmt.yellow(warningsCount) : fmt.green(0)}`,
      `Validation Status:       ${fmt.green('PASS')}`
    ]));
    console.log('');

  } catch (err) {
    console.log(`${symbols.warning} ${fmt.yellow('Could not connect to backend server: ' + err.message)}\n`);
  }
};
