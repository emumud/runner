function handleLock(model, solutions, args) {
  if (model === 'EZ_21' || model === 'EZ_35' || model === 'EZ_40') {
    let responses = [];
    let response = '`VLOCK_ERROR`\nDenied access by HALPERYON SYSTEMS `N' + model + '` lock.';

    if (args[model.toLowerCase()] !== undefined) {
      responses.push(args[model.toLowerCase()]);
    }

    if (args[model] !== undefined) {
      responses.push(args[model]);
    }

    for (let i = 0; i < responses.length; i++) {
      if (typeof responses[i] !== 'string') {
        response = '`VLOCK_ERROR`\n`N' + responses[i] + '` is not a string.';
        continue;
      }

      if (responses[i] !== solutions[model]) {
        response = '`VLOCK_ERROR`\n`V"' + responses[i] + '"` is not the correct unlock command.';
        continue;
      }

      if (model === 'EZ_21') {
        response = '`NLOCK_UNLOCKED` ' + model;
        break;
      }

      if (model === 'EZ_35') {
        if (args.digit === undefined) {
          response = '`VLOCK_ERROR`\nRequired unlock parameter `Ndigit` is missing.';
          continue;
        }

        if (typeof args.digit !== 'number') {
          response = '`VLOCK_ERROR`\n`V"' + args.digit.toString() + '`" is not a number.';
          continue;
        }

        if (args.digit !== solutions.digit) {
          response = '`VLOCK_ERROR`\n`V' + args.digit + '` is not the correct digit.';
          continue;
        }

        response = '`NLOCK_UNLOCKED` ' + model;
        break;
      }

      if (model === 'EZ_40') {
        if (args.ez_prime === undefined) {
          response = '`VLOCK_ERROR`\nRequired unlock parameter `Nez_prime` is missing.';
          continue;
        }

        if (typeof args.ez_prime !== 'number') {
          response = '`VLOCK_ERROR`\n`V"' + args.ez_prime.toString() + '`" is not a number.';
          continue;
        }

        if (args.ez_prime !== solutions.ez_prime) {
          response = '`VLOCK_ERROR`\n`V' + args.ez_prime + '` is not the correct prime.';
          continue;
        }

        response = '`NLOCK_UNLOCKED` ' + model;
        break;
      }
    }

    return [response, !response.includes('LOCK_ERROR')];
  }

  if (model === 'data_check_v1' || model === 'data_check_v2' || model === 'data_check_v3' || model === 'data_check_v4') {
    const d_questions = solutions.DATA_CHECK.questions;
    const d_solutions = solutions.DATA_CHECK.solutions;

    const solutionString = d_solutions.join('');

    if (args.DATA_CHECK === undefined) {
      return ['`VLOCK_ERROR`\nDenied access by `NDATA_CHECK` lock.', false];
    }

    if (args.DATA_CHECK !== solutionString) {
      return [d_questions.join('\n'), 'override'];
    }

    return ['`NLOCK_UNLOCKED` DATA_CHECK', true];
  }

  return ['`VLOCK_ERROR`\nDenied access by `N' + model + ' lock. (emumud: unknown lock)', false];
}

function unlock(gc, upgrades) {
  return `unlock (gc: ${gc}, upgrades: ${upgrades.join(', ')})`;
}

function (context, args) {
  const locks = TEMPLATE_LOCKS;
  const solutions = TEMPLATE_SOLUTIONS;
  const gc = TEMPLATE_GC;
  const upgrades = TEMPLATE_UPGRADES;

  if (hardline.status() === false) {
    return ':::TRUST COMMUNICATION::: hardline required - activate with kernel.hardline';
  }

  if (args === null) {
    return `Connected to ${context.this_script}`;
  }

  if (locks.length === 0) {
    return unlock(gc, upgrades);
  }

  let output = [];
  let override = '';
  let unlocked = true;

  for (let i = 0; i < locks.length; i++) {
    let response = handleLock(locks[i], solutions, args);

    if (response[1] === 'override') {
      override = response[0];
      break;
    }

    output.push(response[0]);

    if (response[1] === false) {
      unlocked = false;
      break;
    }
  }

  if (override !== '') {
    return override;
  }

  if (unlocked) {
    return unlock(gc, upgrades);
  }

  return output.join('\n');
}