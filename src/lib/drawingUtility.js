export function drawTimer(ctx, position, millisRemaining) {
    const secondsRemaining = millisRemaining / 1000;
    ctx.fillStyle = 'black';
    const width = 160;
    const height = 90;
    ctx.fillRect(position.x, position.y, width, height);
    
    ctx.fillStyle = "white";
    ctx.font = '36px serif';
    const label = "Round:";
    var textX =  position.x + (width / 2) - (ctx.measureText(label).width / 2);
    ctx.fillText(label, textX, position.y + 35);
    
    const minutes = (Math.floor(secondsRemaining / 60)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    const seconds = (Math.floor(secondsRemaining % 60)).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
    const timerText = minutes + ":" + seconds;
    if (secondsRemaining < 60) {
        ctx.fillStyle = 'red';
    }
    else {
        ctx.fillStyle = "white";
    }
    ctx.font = '36px monospace';
    textX =  position.x + (width / 2) - (ctx.measureText(timerText).width / 2);
    ctx.fillText(timerText, textX, position.y + 75);
}