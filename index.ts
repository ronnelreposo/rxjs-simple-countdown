import { fromEvent, merge, interval, Observable } from "rxjs";
import {
  mapTo,
  switchMap,
  scan,
  distinctUntilChanged,
  filter
} from "rxjs/operators";

/**
 * Start is implemented.
 * Pause implemented.
 * Reset implemented.
 *
 * First Attempt: [BUG] Observed behavior: When the start, pause and start again resets back to 60.
 *
 * Second Attempt:
 *  on start - decrease timer when there is a start command,
 *  on pause - do nothing if pause.
 *  on reset - Reset back the ticker.
 *
 * You may extend this feature to have an input for desired minutes to countdown,
 * rather than hardcoded.
 */

const start$: Observable<"start"> = fromEvent(
  document.getElementById("startButton"),
  "click"
).pipe(mapTo("start"));
const pause$: Observable<"pause"> = fromEvent(
  document.getElementById("pauseButton"),
  "click"
).pipe(mapTo("pause"));
const reset$: Observable<"reset"> = fromEvent(
  document.getElementById("resetButton"),
  "click"
).pipe(mapTo("reset"));

type Command = "start" | "pause" | "reset";

const commands$: Observable<Command> = merge(start$, pause$, reset$);

/**
 * desired minutes to run.
 */
const minuteSec = 60;

const ticker$ = interval(1000);

const matchCommand = (resetCountdown: number) => (
  lastCountdown: number,
  command: Command
): number => {
  switch (command) {
    case "start": {
      return lastCountdown - 1;
    }
    case "pause": {
      return lastCountdown;
    }
    case "reset": {
      return resetCountdown;
    }
    default: {
      throw new Error("unknown command.");
    }
  }
};

const timer$ = commands$.pipe(
  switchMap(command => ticker$.pipe(mapTo(command))),
  scan(matchCommand(minuteSec), minuteSec),
  filter(n => n > -1),
  distinctUntilChanged()
  // tap(n => console.log("data: ", n)),
);

let result = document.getElementById("result");
result.innerHTML = minuteSec.toString();

timer$.subscribe(x => {
  result.innerHTML = x.toString();
});
