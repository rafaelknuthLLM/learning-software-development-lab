/**
 * Supabase Project Listing Utility
 * Displays and manages Supabase project information
 */

class SupabaseProjectManager {
  constructor() {
    // Current project from context
    this.currentProject = {
      id: "hgbfbvtujatvwpjgibng",
      organization_id: "wvkxkdydapcjjdbsqkiu", 
      name: "permit-place-dashboard-v2",
      region: "us-west-1",
      created_at: "2025-04-22T17:22:14.786709Z",
      status: "ACTIVE_HEALTHY"
    };
  }

  /**
   * Display current project information
   */
  displayCurrentProject() {
    console.log('\n🚀 Current Supabase Project');
    console.log('==========================');
    console.log(`📝 Name: ${this.currentProject.name}`);
    console.log(`🆔 Project ID: ${this.currentProject.id}`);
    console.log(`🏢 Organization: ${this.currentProject.organization_id}`);
    console.log(`🌍 Region: ${this.currentProject.region}`);
    console.log(`📅 Created: ${new Date(this.currentProject.created_at).toLocaleDateString()}`);
    console.log(`✅ Status: ${this.currentProject.status}`);
    console.log('==========================\n');

    return this.currentProject;
  }

  /**
   * List all projects (currently showing the one available)
   */
  listProjects() {
    console.log('\n📋 Supabase Projects List');
    console.log('=========================');
    
    const projects = [this.currentProject];
    
    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Region: ${project.region}`);
      console.log(`   Status: ${project.status}`);
      console.log(`   Created: ${new Date(project.created_at).toLocaleDateString()}`);
      console.log('');
    });

    return projects;
  }

  /**
   * Get project details by ID
   */
  getProjectById(id) {
    if (id === this.currentProject.id) {
      return this.currentProject;
    }
    return null;
  }

  /**
   * Check project health status
   */
  getProjectHealth(id = null) {
    const project = id ? this.getProjectById(id) : this.currentProject;
    
    if (!project) {
      return { status: 'NOT_FOUND', healthy: false };
    }

    const isHealthy = project.status === 'ACTIVE_HEALTHY';
    
    return {
      status: project.status,
      healthy: isHealthy,
      uptime: this.calculateUptime(project.created_at),
      lastCheck: new Date().toISOString()
    };
  }

  /**
   * Calculate project uptime
   */
  calculateUptime(createdAt) {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days} days, ${hours} hours`;
  }

  /**
   * Format project data for display
   */
  formatProjectForDisplay(project) {
    return {
      name: project.name,
      id: project.id,
      region: project.region,
      status: project.status,
      healthy: project.status === 'ACTIVE_HEALTHY',
      created: new Date(project.created_at).toLocaleDateString(),
      uptime: this.calculateUptime(project.created_at)
    };
  }

  /**
   * Export projects to JSON
   */
  exportToJson() {
    return JSON.stringify([this.currentProject], null, 2);
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SupabaseProjectManager;
} else {
  window.SupabaseProjectManager = SupabaseProjectManager;
}

// CLI interface
if (require.main === module) {
  const manager = new SupabaseProjectManager();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'list':
      manager.listProjects();
      break;
    case 'current':
      manager.displayCurrentProject();
      break;
    case 'health':
      const health = manager.getProjectHealth();
      console.log('\n🏥 Project Health Check');
      console.log('======================');
      console.log(`Status: ${health.status}`);
      console.log(`Healthy: ${health.healthy ? '✅' : '❌'}`);
      console.log(`Uptime: ${health.uptime}`);
      console.log(`Last Check: ${new Date(health.lastCheck).toLocaleString()}`);
      break;
    case 'export':
      console.log(manager.exportToJson());
      break;
    default:
      console.log('\n🔧 Supabase Project Manager');
      console.log('Usage: node project-list.js [command]');
      console.log('Commands:');
      console.log('  list    - List all projects');
      console.log('  current - Show current project');
      console.log('  health  - Check project health');
      console.log('  export  - Export projects to JSON');
      manager.displayCurrentProject();
  }
}