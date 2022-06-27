// request initiative rolls from players. also works for selected tokens for the GM.
// you may input any function in the action (default is a dex check).
// combat is created if none exist, and tokens are toggled for combat if not already.
// required modules: requestor.

const action = async () => {
  if(!game.user.isGM){
    const tok = token ?? game.user.character?.getActiveTokens()[0];
    if(!tok) return ui.notifications.warn("Need a token.");
    if(tok.combatant && tok.combatant.initiative !== null) return;
    const {formula} = await tok.actor.rollAbilityTest("dex", {
      chatMessage: false, event, parts: [tok.actor.data.data.attributes.init.value]
    });
    if(!formula) return;
    if(!tok.combatant) await tok.toggleCombat();
    await tok.actor.rollInitiative({initiativeOptions: {formula}});
  }else{
    const toks = canvas.tokens.controlled;
    if(toks.length < 1) return ui.notifications.warn("Need a token.");
    for(tok of toks){
      if(tok.combatant && tok.combatant.initiative !== null) continue;
      const {formula} = await tok.actor.rollAbilityTest("dex", {
        chatMessage: false, event, parts: [tok.actor.data.data.attributes.init.value]
      });
      if(!formula) continue;
      if(!tok.combatant) await tok.toggleCombat();
      await tok.actor.rollInitiative({initiativeOptions: {formula}});
    }
  }
}
const description = `<p style="text-align:center">Roll initiative!</p>`;
const img = "icons/skills/melee/weapons-crossed-swords-yellow.webp";
const label = "Roll!";
const title = "Initiative";
const limit = Requestor.CONST.LIMIT.FREE;
const context = {popout: true, autoClose: true};
const combat = game.combat ?? await Combat.create({scene: canvas.scene.id, active: true});
await Requestor.request({buttonData: [{action, label}], img, description, title, limit, context});
