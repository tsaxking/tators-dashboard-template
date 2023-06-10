// ▀█▀ ▄▀▄ ▀▄▀ █   ▄▀▄ █▀▄    ▄▀▀ ▄▀▄ █▄ ▄█ █▄ ▄█ ██▀ █▄ █ ▀█▀ ▄▀▀ 
//  █  █▀█  █  █▄▄ ▀▄▀ █▀▄    ▀▄▄ ▀▄▀ █ ▀ █ █ ▀ █ █▄▄ █ ▀█  █  ▄█▀ 

// good start, be sure to make it year specific
// We'll make a new page for each year, but we still want to be able to look at old years
// good commenting! It could be a bit better in the .render() method

// Be sure to remove console.log()s before you push! - done

// .flat() is weirdly not supported by TS es6, so be careful using it in the future
// TS does support spread syntax but you have to type it well (either as a tuple or an array)
// I'd recommend spreading from here on out, but it's up to you
// - I was returning arrays inside a map then flattening them afterward so spread syntax is kinda hard to use for that
// - (I'm just going to add a TS6 friendly version of flattening using spread syntax to global.js)

class OverallGridHeatmap {
    /**
     * Gets every match in a given year
     * @param {number} year The year you want matches for 
     * @returns {Object[]}
     */
    static async getAllMatches(year) {
        return await requestFromServer({ 
            url: "/events/get-all-matches", 
            body: { 
                year,
            },
        })
    }

    static gridHeatmapImage = new CanvasImage(`../static/pictures/2023/grid.jpg`);

    /**
     * Creates a card that will display a heatmap of the placements over an entire event 
     * @param {string[]} compLevels An array of comp levels to filter by in case you want separate heatmaps for finals and quals.
     * leave this as an empty array to include all matches 
     * @param {Node} container A container for this to add itself to
     * @param {boolean} winningAlliances Whether this should only include placements of alliances that win
     */
    constructor(compLevels, container, winningAlliances) {
        this.container = container;
        this.compLevels = compLevels;
        this.allCompLevels = !this.compLevels.length;
        this.winningAlliances = winningAlliances;

        this.build();

        window.addEventListener("resize", _ => {
            // The matches are set within the render so this.matches are 
            // just the matches that where rendered the most recently
            // this.render() contains a check to see if the inserted matches exist or not
            this.render(this.matches);
        });
    }

    /**
     * Creates all of the html elements used by the heatmap
     *  and adds them to the container
     */
    build() {
        // Generates are card that looks like this
        // <div class="col">
        //     <div class="card p-0">      
        //         <div class="card-header">
        //             <h4 class="card-title">Grid Heatmap</h4>
        //         </div>
        //         <div class="card-body">
        //             <span>Wire Protector --></span>
        //             <canvas></canvas>
        //         </div>
        //     </div>
        // </div>

        // ▄▀▀ ▄▀▄ █   
        // ▀▄▄ ▀▄▀ █▄▄ 
        this.col = createElementFromSelector(".col-6");
        this.container.appendChild(this.col);

        // ▄▀▀ ▄▀▄ █▀▄ █▀▄ 
        // ▀▄▄ █▀█ █▀▄ █▄▀ 
        this.card = createElementFromSelector(".card.p-0");
        this.col.appendChild(this.card);

        // █▄█ ██▀ ▄▀▄ █▀▄ ██▀ █▀▄ 
        // █ █ █▄▄ █▀█ █▄▀ █▄▄ █▀▄ 
        this.header = createElementFromSelector(".card-header");
        this.card.appendChild(this.header);

        // ▀█▀ █ ▀█▀ █   ██▀ 
        //  █  █  █  █▄▄ █▄▄ 
        this.title = createElementFromSelector(".card-title");

        const { compLevels, winningAlliances } = this;
        const { length } = compLevels;

        this.title.innerHTML = `
            Grid Heatmap For Comp Levels: ${length ? compLevels.join(", ") : "All"} 
            ${winningAlliances ? "<br>And Only Winning Alliances" : ""}
        `;
        this.header.appendChild(this.title);

        // ██▄ ▄▀▄ █▀▄ ▀▄▀ 
        // █▄█ ▀▄▀ █▄▀  █  
        this.body = createElementFromSelector(".card-body");

        const orientationDisplay = createElementFromText(`
            <p class="text-right">Wire Protector Side</p>
        `);
        this.card.appendChild(this.body);

        // ▄▀▀ ▄▀▄ █▄ █ █ █ ▄▀▄ ▄▀▀ 
        // ▀▄▄ █▀█ █ ▀█ ▀▄▀ █▀█ ▄█▀ 
        this.canvas = document.createElement("canvas");
        this.canvasObj = new Canvas(this.canvas);

        this.body.appendChild(this.canvas);
        this.body.appendChild(orientationDisplay);
    }

    render(matches) {
        // On resize this function is called and passes in this.matches so this is a check that
        // this has been rendered before and has as a result stored matches in this.matches
        if (!matches) return;
        // Storing the matches so that we can re-render on resize
        this.matches = matches;

        const { compLevels, winningAlliances, allCompLevels, canvasObj } = this;

        const { gridHeatmapImage } = OverallGridHeatmap;
        const { resizeGridHeatmap } = GridHeatmapRectangle;

        // Resizing the canvas to fit within the card body
        // and so that it has the correct aspect ratio
        resizeGridHeatmap(this.canvas, this.body);

        // Creating the background image of the grid
        gridHeatmapImage.draw(canvasObj);

        // Getting an array of every valid score breakdown
        const scoreBreakdowns = flatten(matches.map(m => {
            // The names of the properties were single letters for more compact data storage
            const { s: scoreBreakdown, w: winningAlliance, c: compLevel } = m;

            // Checking that either this display is accepting every comp level's data
            // or the comp level of the match is one of this display's allowed comp levels
            const compLevelCorrect = allCompLevels || compLevels.includes(compLevel);

            // Empty arrays get removed when you flatten everything
            if (!compLevelCorrect) return [];

            // Getting the two alliances
            const { red, blue } = scoreBreakdown;

            // There are a couple blue alliance matches where the winning alliance is an empty array
            // this might just be because of ties?
            // anyways, if there is no winning alliance and we need to know which alliance won
            // we can just return an empty array that will get removed by the flatten
            if (winningAlliances && !winningAlliance) return [];
            
            // If we only care about the winning alliance it will return
            // only the winning alliance's score breakdown.
            // Otherwise, we can return both score breakdowns
            // this is ok because everything is flattened afterwards so we can return any amount of items
            const alliances = winningAlliances ? scoreBreakdown[winningAlliance]: [red, blue];
            
            return alliances;
        }), 1);


        const { length } = scoreBreakdowns;
        // Getting a doubled array of of rectangles that are scaled to a canvas 
        // and are scaled to the max amount of matches
        // by just setting the amount of matches that a bot placed on the respective node for that rect
        // and then rect.draw()ing, the rects can normalize and then draw the rect as a different color
        const rects = HeatmapRectangle.getRects(9, 3, length, [new Color(0, 0, 255, 0.25), new Color(0, 255, 0, 1)], true);

        rects.forEach(rect => {
            // This is getting the rect's position relative to the other rectangles
            // So if it is on the middle row then the y position will be 1
            // and if it is the center cube node it's x position will be 5
            const { heatmapX, heatmapY } = rect;

            // Getting the letter that represents the row since 
            // the blue alliance uses an object and not an array for 
            const row = ["T", "M", "B"][heatmapY];

            // Getting how many score breakdowns there are
            // where a bot placed in each node
            const placed = scoreBreakdowns.filter(scoreBreakdown => {
                // The 8 - Heatmap X flips the grid since the blue alliance's grid is flipped from our grid
                const node = scoreBreakdown[row][8 - heatmapX];

                // The node is already set to a truthy value inside event-route.js on the server
                return node;
            }).length;

            // Setting the rects amount to the amount of times a node has been place on
            // this will change what color the rect selects
            rect.amount = placed;
            rect.draw(this.canvasObj);
        });
    }
}

let ya_matches,
ya_currentYear,
ya_built,
ya_gridHeatmaps;

const ya_gridHeatmapContainer = document.querySelector("#ya--grid-heatmap-container");
OverallGridHeatmap.gridHeatmapImage.render();

async function ya_main() {
    const { year } = currentEvent.info;

    // Checking if the html for each heatmap has already been added to the DOM
    // This makes sure that there is only 1 of each heatmap even if you re-open the page
    if (!ya_built) {
        // new OverallGridHeatmap([], ya_gridHeatmapContainer, false);
        
        ya_gridHeatmaps = [
            new OverallGridHeatmap(["qm"], ya_gridHeatmapContainer, false),
            new OverallGridHeatmap(["qm"], ya_gridHeatmapContainer, true),
            new OverallGridHeatmap(["ef", "qf", "sf", "f"], ya_gridHeatmapContainer, false),
            new OverallGridHeatmap(["ef", "qf", "sf", "f"], ya_gridHeatmapContainer, true),
        ];

        ya_built = true;
    };

    // Checking that the year that is going to be loaded isn't
    // the same as the year that is already loaded
    if (ya_currentYear != year) {
        const { getAllMatches } = OverallGridHeatmap;
        const { ProgressBar } = CustomBootstrap;

        // Getting cached info on the year to 
        // prevent the need to remake the same request
        let info = localStorage[year];

        try {
            // Parsing info if it is a valid json
            info = JSON.parse(info);
        } catch {}
        
        // Checking if there is no info or if the info was last updated a day ago
        if (!info || !info.lastUpdated || (Date.now() - info.lastUpdated) > 1000 * 60 * 60 * 24) {
            // ▀█▀ ▄▀▄ ▀▄▀ █   ▄▀▄ █▀▄    ▄▀▀ ▄▀▄ █▄ ▄█ █▄ ▄█ ██▀ █▄ █ ▀█▀ ▄▀▀ 
            //  █  █▀█  █  █▄▄ ▀▄▀ █▀▄    ▀▄▄ ▀▄▀ █ ▀ █ █ ▀ █ █▄▄ █ ▀█  █  ▄█▀ 
            // this should probably be a pipe
            // so first get all events (one request)
            // then get pipe all matches (one request?)
            // then you can have a CustomBootstrap.ProgressBar()
            // Because it looked like nothing was happening for a while and I thought it was broken
            // perhaps you'll need to make use XMLHttpRequests? - I think XMLHttpRequests are just earlier versions of fetch that only allow .then(), how would they speed up stuff?
            
            // creating a progress bar that will eventually 
            // tell you how many matches have been received
            const progressBar = new ProgressBar();

            // Changing info so that it is up to date
            info = {
                matches: await getAllMatches(year), 
                lastUpdated: Date.now(),
            };

            // Storing info in local storage and using the year as the key
            localStorage.setItem(year, JSON.stringify(info));

            // Removing the progress bar
            progressBar.destroy();
        }

        // Caching info's matches so that when the page is loaded 
        // again we don't have to request them a second time
        ya_matches = info.matches;

        // Rendering the matches
        ya_gridHeatmaps.forEach(gh => {
            gh.render(ya_matches);
        });

        // Setting the loaded year to the current year so that we don't 
        // re-request things if we load the page again without changing the year
        ya_currentYear = year;
    }

}

mainFunctions["Year Analysis"] = ya_main;
// ▀█▀ ▄▀▄ ▀▄▀ █   ▄▀▄ █▀▄    ▄▀▀ ▄▀▄ █▄ ▄█ █▄ ▄█ ██▀ █▄ █ ▀█▀ ▄▀▀ 
//  █  █▀█  █  █▄▄ ▀▄▀ █▀▄    ▀▄▄ ▀▄▀ █ ▀ █ █ ▀ █ █▄▄ █ ▀█  █  ▄█▀ 
// In addition to the pipe requests, I think the response should be stored as a json in window.localStorage - done
// This way, if you refresh the page, you don't have to make the same request again
// In addition, it'll be easy to make a good gui for the use to run their own filters
// We should also figure out some more things to build for this page