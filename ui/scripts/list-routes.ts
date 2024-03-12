import fs from 'fs';
import path from 'path';

// Define the path to the routes directory
const routesPath = path.join(__dirname, '../src/routes');

// Function to recursively find all .svelte files in a directory
function findSvelteFiles(dir: string, filelist: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = findSvelteFiles(path.join(dir, file), filelist);
    } else if (file.endsWith('.svelte')) {
      filelist.push(path.join(dir, file));
    }
  });

  return filelist;
}

// Function to group routes by their first segment
function groupRoutesByCategory(routes: string[]): Record<string, string[]> {
  const groupedRoutes: Record<string, string[]> = {};

  routes.forEach((route) => {
    const cleanedRoute = route
      .replace(routesPath, '')
      .replace('+page.svelte', '')
      .replace('+layout.svelte', '')
      .replace('+error.svelte', '');

    const firstSegment = cleanedRoute.split('/')[1]; // Get the first segment of the route
    if (!groupedRoutes[firstSegment]) {
      groupedRoutes[firstSegment] = [];
    }
    groupedRoutes[firstSegment].push(cleanedRoute);
  });

  delete groupedRoutes[''];
  groupedRoutes['home'] = ['/'];

  const sortedRoutes = Object.entries(groupedRoutes).sort((a, b) => {
    if (a[0] === 'home') {
      return -1;
    } else if (b[0] === 'home') {
      return 1;
    } else {
      return a[0].localeCompare(b[0]);
    }
  });

  return Object.fromEntries(sortedRoutes);
}

// Function to output the routes to a Markdown file
function outputRoutes(routes: string[], outputPath: string) {
  const groupedRoutes = groupRoutesByCategory(routes);
  let markdownContent = `# Routes Overview\n\nThis document provides an overview of the routes available in our SvelteKit application.\n\n`;

  Object.entries(groupedRoutes).forEach(([category, routes]) => {
    markdownContent += `## ${category}\n\n`;
    routes.forEach((route) => {
      markdownContent += `- ${route}\n`;
    });
    markdownContent += '\n'; // Add a newline between categories
  });

  fs.writeFileSync(outputPath, markdownContent);
}

// Find all .svelte files in the routes directory
const svelteFiles = findSvelteFiles(routesPath);

// Output the routes to a Markdown file
outputRoutes(svelteFiles, path.join(__dirname, '../documentation/routes.md'));
