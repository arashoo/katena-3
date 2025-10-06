import React, {useState, useEffect} from 'react';
import './Projects.css';
import StatusConfirmationModal from './StatusConfirmationModal';

// Glass Availability Indicator Component
const GlassAvailabilityIndicator = ({ width, height, color, thickness }) => {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!width || !height || !color || !thickness) {
        setAvailability(null);
        return;
      }

      setLoading(true);
      try {
        console.log('🔍 GlassAvailabilityIndicator Search Parameters:');
        console.log('Width:', width, 'Type:', typeof width);
        console.log('Height:', height, 'Type:', typeof height);
        console.log('Color:', color, 'Type:', typeof color);
        console.log('Thickness:', thickness, 'Type:', typeof thickness);
        
        const response = await fetch('http://localhost:3001/api/glasses');
        const glasses = await response.json();
        
        const matchingGlass = glasses.find(glass => 
          glass.width === parseFloat(width) && 
          glass.height === parseFloat(height) && 
          glass.color && color && glass.color.toLowerCase() === color.toLowerCase() && 
          (
            // If both have thickness, they must match
            (glass.thickness && thickness && glass.thickness === thickness) ||
            // If neither has thickness, it's a match
            (!glass.thickness && !thickness) ||
            // If glass doesn't have thickness but we're looking for one, still consider it a match
            (!glass.thickness && thickness) ||
            // If we don't specify thickness but glass has one, still consider it a match
            (glass.thickness && !thickness)
          )
        );
        
        console.log('🎯 GlassAvailabilityIndicator Result:', matchingGlass ? {
          id: matchingGlass.id,
          stockCount: matchingGlass.stockCount,
          reservedCount: matchingGlass.reservedCount
        } : 'NO MATCH');
        
        if (matchingGlass) {
          setAvailability({
            found: true,
            stockCount: matchingGlass.stockCount,
            reservedCount: matchingGlass.reservedCount,
            available: matchingGlass.stockCount > 0
          });
        } else {
          setAvailability({ found: false, available: false, stockCount: 0, reservedCount: 0 });
        }
      } catch (error) {
        console.error('Error checking glass availability:', error);
        setAvailability({ found: false, available: false, stockCount: 0, reservedCount: 0 });
      }
      setLoading(false);
    };

    checkAvailability();
  }, [width, height, color, thickness]);

  if (!width || !height) return null;
  
  if (loading) {
    return <div className="glass-availability loading">Checking...</div>;
  }
  
  if (!availability) return null;

  return (
    <div className={`glass-availability ${availability.available ? 'available' : 'unavailable'}`}>
      {availability.found ? (
        <div className="availability-info">
          <span className={`status-indicator ${availability.available ? 'in-stock' : 'out-of-stock'}`}>
            {availability.available ? '✓' : '✗'}
          </span>
          <span className="stock-info">
            Stock: {availability.stockCount} | Reserved: {availability.reservedCount}
          </span>
        
        </div>
      ) : (
        <div className="availability-info">
          <span className="status-indicator not-found">?</span>
          <span className="stock-info">Glass not found in inventory</span>
        </div>
      )}
    </div>
  );
};

// Function to calculate total inches from expressions like "250+250+23 7/16"
const calculateInches = (expression) => {
  if (!expression || typeof expression !== 'string') return 0;
  
  try {
    // First handle mixed numbers (e.g., "23 7/16" becomes "23+7/16")
    let processedExpression = expression.replace(/(\d+)\s+(\d+\/\d+)/g, '$1+$2');
    
    // Remove remaining spaces
    processedExpression = processedExpression.replace(/\s/g, '');
    
    // Split by + and - operators while keeping the operators
    const parts = processedExpression.split(/([+\-])/).filter(part => part !== '');
    
    let total = 0;
    let currentSign = 1; // 1 for positive, -1 for negative
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part === '+') {
        currentSign = 1;
      } else if (part === '-') {
        currentSign = -1;
      } else {
        // Parse the number part
        let value = 0;
        
        if (part.includes('/')) {
          // Handle fractions like "7/16"
          const [numerator, denominator] = part.split('/').map(Number);
          value = numerator / denominator;
        } else {
          // Handle whole numbers
          value = parseFloat(part) || 0;
        }
        
        total += currentSign * value;
      }
    }
    
    return total;
  } catch (error) {
    console.error('Error calculating inches:', error);
    return 0;
  }
};

// Function to convert inches to feet and inches
const inchesToFeetAndInches = (totalInches) => {
  if (!totalInches || totalInches === 0) return '';
  
  const feet = Math.floor(totalInches / 12);
  const remainingInches = totalInches % 12;
  
  if (feet === 0) {
    return `${remainingInches.toFixed(2)}"`;
  } else if (remainingInches === 0) {
    return `${feet}'`;
  } else {
    return `${feet}' ${remainingInches.toFixed(2)}"`;
  }
};

function Projects() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [preliminaryDrawing, setPreliminaryDrawing] = useState(null);
  const [glassColor, setGlassColor] = useState('');
  const [glassThickness, setGlassThickness] = useState('');
  const [fabricationDrawings, setFabricationDrawings] = useState([]);
  const [fabricationExpanded, setFabricationExpanded] = useState(true);
  const [sections, setSections] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [projectStatus, setProjectStatus] = useState('In Progress');
  const [editingProject, setEditingProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [expandedFabSections, setExpandedFabSections] = useState(new Set());
  const [expandedFabs, setExpandedFabs] = useState(new Set());

  // Status confirmation modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalConfig, setStatusModalConfig] = useState({
    title: '',
    message: '',
    details: [],
    type: 'warning',
    onConfirm: () => {},
    newStatus: '',
    fabricationId: null,
    oldStatus: '',
    selectElement: null
  });

  // Load projects from backend when component mounts
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/projects');
        if (response.ok) {
          const projects = await response.json();
          setSavedProjects(projects);
        } else {
          console.error('Failed to load projects');
        }
      } catch (error) {
        console.error('Error loading projects:', error);
      }
    };

    loadProjects();
  }, []);

  // Initialize all fabrications as expanded when fabricationDrawings changes
  useEffect(() => {
    if (fabricationDrawings.length > 0) {
      const allFabIds = fabricationDrawings.map(fab => fab.id);
      setExpandedFabs(new Set(allFabIds));
    }
  }, [fabricationDrawings.length]);

  const handleNumberOfGlassesChange = (sectionId, numberOfGlasses) => {
    const number = parseInt(numberOfGlasses) || 0;
    
    // Create array of glass objects for this section
    const newGlasses = [];
    for (let i = 0; i < number; i++) {
      // Generate glass identifier: A, B, C, D, ..., Z, AA, BB, CC, etc.
      const getGlassIdentifier = (index) => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (index < 26) {
          return letters[index];
        } else {
          const letterIndex = index % 26;
          const repeatCount = Math.floor(index / 26) + 1;
          return letters[letterIndex].repeat(repeatCount);
        }
      };
      
      newGlasses.push({
        id: i + 1,
        identifier: getGlassIdentifier(i),
        width: '',
        height: ''
      });
    }
    
    // Update the specific section
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, numberOfGlasses: numberOfGlasses, glasses: newGlasses }
        : section
    );
    setSections(updatedSections);
  };

  const toggleSectionExpanded = (sectionId) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId 
        ? { ...section, expanded: !section.expanded }
        : section
    );
    setSections(updatedSections);
  };

  const addFabricationDrawing = () => {
    const newFabId = fabricationDrawings.length > 0 
      ? Math.max(...fabricationDrawings.map(f => f.id)) + 1 
      : 1;
    setFabricationDrawings([...fabricationDrawings, {
      id: newFabId,
      name: `Fab${newFabId}`,
      file: null,
      status: 'Waiting Production',
      deliveryAddress: '',
      shippingDate: '',
      arrivalDate: '',
      gSections: [], // Legacy field
      sections: []   // New sections array for G and Div sections specific to this fabrication
    }]);
  };

  const removeFabricationDrawing = (fabId) => {
    setFabricationDrawings(fabricationDrawings.filter(f => f.id !== fabId));
  };

  // Helper function to toggle individual fabrication expansion
  const toggleFabExpanded = (fabId) => {
    setExpandedFabs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fabId)) {
        newSet.delete(fabId);
      } else {
        newSet.add(fabId);
      }
      return newSet;
    });
  };

  // Helper functions for fabrication-level sections
  const toggleFabSectionsExpanded = (fabId) => {
    setExpandedFabSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fabId)) {
        newSet.delete(fabId);
      } else {
        newSet.add(fabId);
      }
      return newSet;
    });
  };

  const addFabSection = (fabId, sectionType) => {
    const fab = fabricationDrawings.find(f => f.id === fabId);
    if (!fab) return;
    
    const existingSections = fab.sections || [];
    const newId = existingSections.length > 0 ? Math.max(...existingSections.map(s => s.id)) + 1 : 1;
    const sectionCount = existingSections.filter(s => s.type === sectionType).length + 1;
    
    const newSection = {
      id: newId,
      type: sectionType,
      name: `${sectionType}${sectionCount}`,
      totalInches: '',
      numberOfGlasses: '',
      glasses: [],
      expanded: true
    };

    const updatedFabs = fabricationDrawings.map(f =>
      f.id === fabId ? { ...f, sections: [...(f.sections || []), newSection] } : f
    );
    setFabricationDrawings(updatedFabs);
  };

  const updateFabSection = (fabId, sectionId, updatedSection) => {
    const updatedFabs = fabricationDrawings.map(f =>
      f.id === fabId ? {
        ...f,
        sections: (f.sections || []).map(s =>
          s.id === sectionId ? { ...s, ...updatedSection } : s
        )
      } : f
    );
    setFabricationDrawings(updatedFabs);
  };

  const removeFabSection = (fabId, sectionId) => {
    const updatedFabs = fabricationDrawings.map(f =>
      f.id === fabId ? {
        ...f,
        sections: (f.sections || []).filter(s => s.id !== sectionId)
      } : f
    );
    setFabricationDrawings(updatedFabs);
  };

  const toggleFabSectionExpanded = (fabId, sectionId) => {
    const updatedFabs = fabricationDrawings.map(f =>
      f.id === fabId ? {
        ...f,
        sections: (f.sections || []).map(s =>
          s.id === sectionId ? { ...s, expanded: !s.expanded } : s
        )
      } : f
    );
    setFabricationDrawings(updatedFabs);
  };

  // Legacy project-level sections (to be deprecated)
  const addSection = (sectionType) => {
    const newId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
    const sectionCount = sections.filter(s => s.type === sectionType).length + 1;
    setSections([...sections, {
      id: newId,
      type: sectionType,
      name: `${sectionType}${sectionCount}`,
      totalInches: '',
      numberOfGlasses: '',
      glasses: [],
      expanded: true,
      fabricationId: null // Track which fabrication this section belongs to
    }]);
  };

  const saveProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    const newProject = {
      name: projectName,
      status: projectStatus,
      preliminaryDrawing: preliminaryDrawing ? preliminaryDrawing.name : null,
      glassColor,
      glassThickness,
      fabricationDrawings,
      sections,
      gSections: sections, // Map sections to gSections for compatibility
      totalInches: calculateTotalInches(),
      fullData: {
        preliminaryDrawing,
        fabricationDrawings,
        sections
      }
    };

    try {
      const response = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProject)
      });

      if (response.ok) {
        const savedProject = await response.json();
        setSavedProjects([...savedProjects, savedProject]);
        clearForm();
        setShowAddForm(false);
        alert('Project saved successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to save project: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const clearForm = () => {
    setProjectName('');
    setPreliminaryDrawing(null);
    setGlassColor('');
    setGlassThickness('');
    setFabricationDrawings([]);
    setSections([]);
    setFabricationExpanded(true);
    setProjectStatus('In Progress');
    setEditingProject(null);
  };

  const calculateFabTotalInches = (fab, projectSections = null) => {
    // Use fabrication's own sections (new structure) or fallback to project sections (legacy)
    const sectionsToUse = fab.sections || (projectSections || sections).filter(section => 
      section.type === 'G' && section.fabricationId === fab.id.toString()
    );
    
    let totalInches = 0;
    sectionsToUse.forEach(section => {
      if (section.type === 'G' && section.glasses) {
        section.glasses.forEach(glass => {
          if (glass.width && glass.height) {
            totalInches += parseFloat(calculateInches(glass.width, glass.height));
          }
        });
      }
    });
    
    return totalInches.toFixed(2);
  };

  const calculateTotalInches = () => {
    let totalInches = 0;
    sections.forEach(section => {
      if (section.glasses) {
        section.glasses.forEach(glass => {
          if (glass.width && glass.height) {
            totalInches += parseFloat(calculateInches(glass.width, glass.height));
          }
        });
      }
    });
    
    return totalInches.toFixed(2);
  };

  // Glass Inventory Management Functions
  const checkGlassAvailability = async (width, height, color, thickness) => {
    try {
      console.log('🔍 Glass Search Parameters:');
      console.log('Width:', width, 'Type:', typeof width);
      console.log('Height:', height, 'Type:', typeof height);
      console.log('Color:', color, 'Type:', typeof color);
      console.log('Thickness:', thickness, 'Type:', typeof thickness);
      
      const response = await fetch('http://localhost:3001/api/glasses');
      const glasses = await response.json();
      
      console.log('📦 Total glasses in inventory:', glasses.length);
      
      // Find glasses that match width and height first
      const dimensionMatches = glasses.filter(glass => 
        glass.width === parseFloat(width) && 
        glass.height === parseFloat(height)
      );
      
      console.log('📏 Glasses matching dimensions (width=' + width + ', height=' + height + '):', dimensionMatches.length);
      if (dimensionMatches.length > 0) {
        console.log('📏 Dimension matches:', dimensionMatches.map(g => ({ 
          id: g.id, 
          width: g.width, 
          height: g.height, 
          color: g.color, 
          thickness: g.thickness,
          stockCount: g.stockCount 
        })));
      }
      
      // Find matching glass by dimensions and color, with optional thickness matching
      const matchingGlass = glasses.find(glass => 
        glass.width === parseFloat(width) && 
        glass.height === parseFloat(height) && 
        glass.color && color && glass.color.toLowerCase() === color.toLowerCase() && 
        (
          // If both have thickness, they must match
          (glass.thickness && thickness && glass.thickness === thickness) ||
          // If neither has thickness, it's a match
          (!glass.thickness && !thickness) ||
          // If glass doesn't have thickness but we're looking for one, still consider it a match
          (!glass.thickness && thickness) ||
          // If we don't specify thickness but glass has one, still consider it a match
          (glass.thickness && !thickness)
        )
      );
      
      console.log('🎯 Final matching glass:', matchingGlass ? {
        id: matchingGlass.id,
        width: matchingGlass.width,
        height: matchingGlass.height,
        color: matchingGlass.color,
        thickness: matchingGlass.thickness,
        stockCount: matchingGlass.stockCount
      } : 'NO MATCH FOUND');
      
      if (matchingGlass) {
        return {
          found: true,
          stockCount: matchingGlass.stockCount,
          reservedCount: matchingGlass.reservedCount,
          available: matchingGlass.stockCount > 0,
          glassId: matchingGlass.id
        };
      }
      
      return { found: false, available: false, stockCount: 0, reservedCount: 0 };
    } catch (error) {
      console.error('Error checking glass availability:', error);
      return { found: false, available: false, stockCount: 0, reservedCount: 0 };
    }
  };

  const reserveGlassesForProduction = async (projectName, fabricationId) => {
    try {
      console.log('🔄 Starting glass reservation for fabrication:', fabricationId);
      
      const fabrication = fabricationDrawings.find(f => f.id === fabricationId);
      if (!fabrication) {
        console.error('Fabrication not found:', fabricationId);
        return false;
      }
      
      // Get G sections from this fabrication's sections array
      const assignedGSections = (fabrication.sections || []).filter(section => 
        section.type === 'G'
      );
      
      if (assignedGSections.length === 0) {
        console.log('⚠️ No G sections found in this fabrication');
        alert('No G sections found in this fabrication. Please add G sections using the "Manage Sections" button.');
        return false;
      }
      
      console.log('📋 Assigned G sections for reservation:', assignedGSections);
      
      if (assignedGSections.length === 0) {
        console.log('❌ No G sections found for this fabrication');
        alert('No glass sections assigned to this fabrication. Please assign sections first.');
        return false;
      }
      
      const reservationPromises = [];
      let totalGlassesToReserve = 0;
      
      for (const section of assignedGSections) {
        for (const glass of section.glasses) {
          if (glass.width && glass.height) {
            totalGlassesToReserve++;
            console.log(`🔍 Checking availability for glass: ${glass.width}x${glass.height} ${glassColor} ${glassThickness}`);
            
            const availability = await checkGlassAvailability(
              glass.width, 
              glass.height, 
              glassColor, 
              glassThickness
            );
            
            console.log('📊 Availability result:', availability);
            
            if (availability.found && availability.available) {
              console.log(`✅ Reserving glass: ${availability.glassId}`);
              // Reserve the glass
              const reservationPromise = fetch('http://localhost:3001/api/glasses/reserve', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  glassId: availability.glassId,
                  projectName: projectName,
                  quantity: 1
                })
              });
              reservationPromises.push(reservationPromise);
            } else {
              console.log(`❌ Cannot reserve glass: ${glass.width}x${glass.height} - Not available`);
              alert(`Warning: Glass ${glass.width}x${glass.height} ${glassColor} ${glassThickness} is not available in inventory.`);
            }
          }
        }
      }
      
      console.log(`📦 Total glasses to reserve: ${totalGlassesToReserve}`);
      console.log(`📤 Reservation promises: ${reservationPromises.length}`);
      
      if (reservationPromises.length > 0) {
        const results = await Promise.all(reservationPromises);
        console.log('✅ Reservation results:', results);
        alert(`Successfully reserved ${reservationPromises.length} glass pieces for production.`);
      } else {
        alert('No glasses were reserved. Check inventory availability.');
      }
      
      return true;
    } catch (error) {
      console.error('Error reserving glasses:', error);
      alert('Error occurred while reserving glasses. Check console for details.');
      return false;
    }
  };

  // Save current project data to backend
  const saveCurrentProjectData = async () => {
    if (!editingProject) return;
    
    try {
      const updatedProjectData = {
        name: projectName,
        status: projectStatus,
        glassColor,
        glassThickness,
        fabricationDrawings,
        sections,
        gSections: sections,
        totalInches: calculateTotalInches(),
        fullData: {
          preliminaryDrawing,
          fabricationDrawings,
          sections
        }
      };

      const response = await fetch(`http://localhost:3001/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProjectData)
      });

      if (response.ok) {
        const savedProject = await response.json();
        setSavedProjects(savedProjects.map(p => p.id === editingProject.id ? savedProject : p));
        console.log('✅ Project data saved to backend');
      }
    } catch (error) {
      console.error('Error saving project data:', error);
    }
  };

  // Check glass allocation for a specific fabrication (now handles Production confirmation)
  const checkGlassAllocation = async (fabricationId, fabricationName) => {
    try {
      console.log(`🔍 Checking glass allocation for fabrication: ${fabricationName} (ID: ${fabricationId})`);
      
      const fabrication = fabricationDrawings.find(f => f.id === fabricationId);
      
      if (!fabrication) {
        console.error('Fabrication not found:', fabricationId);
        return false;
      }

      // Check if fabrication is already in Production
      if (fabrication.status === 'Production') {
        setStatusModalConfig({
          title: 'Already in Production',
          message: `"${fabricationName}" is already in Production status.`,
          details: [
            'Glass is already allocated and reserved',
            'Glass pieces are committed to this project',
            'To make changes, move status back to Design first'
          ],
          type: 'info',
          fabricationId,
          onConfirm: () => {
            setShowStatusModal(false);
          }
        });
        setShowStatusModal(true);
        return false;
      }

      // Get G sections from this fabrication's sections array
      const assignedGSections = (fabrication.sections || []).filter(section => 
        section.type === 'G'
      );
      
      if (assignedGSections.length === 0) {
        alert(`No G sections defined for fabrication "${fabricationName}". Please add G sections using the 'Manage Sections' button.`);
        return false;
      }
      
      // Calculate total glass needed for this fabrication
      let totalGlassNeeded = 0;
      const glassRequirements = [];
      
      for (const section of assignedGSections) {
        for (const glass of section.glasses) {
          if (glass.width && glass.height) {
            totalGlassNeeded++;
            glassRequirements.push({
              width: glass.width,
              height: glass.height,
              color: glassColor,
              thickness: glassThickness,
              section: section.name,
              identifier: glass.identifier
            });
          }
        }
      }
      
      console.log(`📋 Total glass needed for fabrication: ${totalGlassNeeded}`);
      console.log(`📝 Glass requirements:`, glassRequirements);
      
      if (totalGlassNeeded === 0) {
        alert(`No glasses defined in G sections for fabrication "${fabricationName}".`);
        return false;
      }
      
      // Check current reservations for this project
      try {
        const response = await fetch('http://localhost:3001/api/glasses');
        const glasses = await response.json();
        
        // Group glass requirements by type to handle multiple glass types
        const glassTypes = {};
        for (const req of glassRequirements) {
          const key = `${req.width}x${req.height}_${req.color}_${req.thickness}`;
          if (!glassTypes[key]) {
            glassTypes[key] = {
              width: req.width,
              height: req.height,
              color: req.color,
              thickness: req.thickness,
              needed: 0,
              pieces: []
            };
          }
          glassTypes[key].needed++;
          glassTypes[key].pieces.push(`${req.section}-${req.identifier}`);
        }
        
        console.log(`📋 Glass types needed:`, glassTypes);
        
        let allPerfectlyAllocated = true;
        let statusReport = [];
        
        for (const [typeKey, typeInfo] of Object.entries(glassTypes)) {
          // Find matching glass in inventory
          const matchingGlass = glasses.find(glass => 
            glass.width === parseFloat(typeInfo.width) && 
            glass.height === parseFloat(typeInfo.height) && 
            glass.color && typeInfo.color && 
            glass.color.toLowerCase() === typeInfo.color.toLowerCase() && 
            glass.thickness === typeInfo.thickness
          );
          
          if (!matchingGlass) {
            statusReport.push(`❌ ${typeKey}: Not found in inventory`);
            allPerfectlyAllocated = false;
            continue;
          }
          
          // Check current reservations for this project
          const projectReservation = matchingGlass.reservedProjects.find(
            proj => proj.projectName === projectName
          );
          
          const currentlyAllocated = projectReservation ? projectReservation.quantity : 0;
          
          if (currentlyAllocated === typeInfo.needed) {
            statusReport.push(`✅ ${typeKey}: Perfect (${currentlyAllocated}/${typeInfo.needed})`);
          } else if (currentlyAllocated > typeInfo.needed) {
            const excess = currentlyAllocated - typeInfo.needed;
            statusReport.push(`⚠️ ${typeKey}: Over-allocated (+${excess}) (${currentlyAllocated}/${typeInfo.needed})`);
            allPerfectlyAllocated = false;
          } else {
            const shortage = typeInfo.needed - currentlyAllocated;
            statusReport.push(`❌ ${typeKey}: Under-allocated (-${shortage}) (${currentlyAllocated}/${typeInfo.needed})`);
            allPerfectlyAllocated = false;
          }
        }
        
        // Show Production confirmation modal with allocation report
        const reportDetails = [
          'Glass Allocation Report:',
          ...statusReport,
          '',
          `G Sections: ${assignedGSections.map(s => s.name).join(', ')}`,
          '',
          'Production actions:',
          '• Lock the glass inventory for this fabrication',
          '• Reserve the required glass pieces',
          '• Prevent changes to glass specifications',
          '• Glass becomes committed to this project'
        ];

        setStatusModalConfig({
          title: 'Move to Production',
          message: `Are you sure you want to move "${fabricationName}" to Production status?`,
          details: reportDetails,
          type: allPerfectlyAllocated ? 'warning' : 'danger',
          newStatus: 'Production',
          fabricationId,
          oldStatus: fabrication.status,
          onConfirm: async () => {
            await reserveGlassesForProduction(projectName, fabricationId);
            const updatedFabs = fabricationDrawings.map(f =>
              f.id === fabricationId ? { ...f, status: 'Production' } : f
            );
            setFabricationDrawings(updatedFabs);
            setShowStatusModal(false);
          }
        });
        setShowStatusModal(true);
        
        return allPerfectlyAllocated;
        
      } catch (error) {
        console.error('Error checking glass allocation:', error);
        alert('Error checking glass allocation. Please try again.');
        return false;
      }
      
    } catch (error) {
      console.error('Error in glass allocation check:', error);
      alert('Error occurred while checking allocation. Check console for details.');
      return false;
    }
  };

  const removeGlassesAfterShipping = async (projectName, fabricationId) => {
    try {
      console.log(`🚚 Starting glass removal for shipping - Project: ${projectName}, Fabrication: ${fabricationId}`);
      
      const fabrication = fabricationDrawings.find(f => f.id === fabricationId);
      if (!fabrication) {
        console.error('Fabrication not found:', fabricationId);
        return false;
      }
      
      // Get G sections from this fabrication's sections array
      const assignedGSections = (fabrication.sections || []).filter(section => 
        section.type === 'G'
      );
      
      if (assignedGSections.length === 0) {
        console.log('No G sections found in this fabrication');
        return true;
      }
      
      console.log(`📋 Found ${assignedGSections.length} G sections:`, assignedGSections.map(s => s.name));
      
      const removalPromises = [];
      let totalGlassesToRemove = 0;
      
      for (const section of assignedGSections) {
        console.log(`🔍 Processing section: ${section.name}`);
        
        for (const glass of section.glasses) {
          if (glass.width && glass.height) {
            totalGlassesToRemove++;
            console.log(`📦 Glass to remove: ${glass.width}x${glass.height} ${glassColor} ${glassThickness}`);
            
            // Find the glass in inventory to get the correct glass ID
            const availability = await checkGlassAvailability(
              glass.width, 
              glass.height, 
              glassColor, 
              glassThickness
            );
            
            if (availability.found) {
              console.log(`✅ Found glass in inventory with ID: ${availability.glassId}`);
              
              // Remove the glass from inventory using the backend API
              const removalPromise = fetch('http://localhost:3001/api/glasses/remove', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  glassId: availability.glassId,
                  projectName: projectName,
                  quantity: 1
                })
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to remove glass: ${response.statusText}`);
                }
                return response.json();
              })
              .then(result => {
                console.log(`✅ Successfully removed glass:`, result);
                return result;
              })
              .catch(error => {
                console.error(`❌ Failed to remove glass ${availability.glassId}:`, error);
                throw error;
              });
              
              removalPromises.push(removalPromise);
            } else {
              console.warn(`⚠️ Glass not found in inventory: ${glass.width}x${glass.height} ${glassColor} ${glassThickness}`);
            }
          }
        }
      }
      
      console.log(`📊 Total glass pieces to remove: ${totalGlassesToRemove}`);
      console.log(`🔄 Processing ${removalPromises.length} removal requests...`);
      
      if (removalPromises.length > 0) {
        const results = await Promise.all(removalPromises);
        console.log('🎉 All glass removal operations completed successfully:', results);
        
        // Calculate total removed quantity
        const totalRemoved = results.reduce((sum, result) => sum + (result.removedQuantity || 1), 0);
        console.log(`📈 Total pieces removed from inventory: ${totalRemoved}`);
        
        return true;
      } else {
        console.log('⚠️ No glass pieces were found to remove');
        return true;
      }
      
    } catch (error) {
      console.error('❌ Error removing glasses after shipping:', error);
      return false;
    }
  };

  // Status confirmation handler (no longer handles Shipped from dropdown)
  const handleStatusConfirmation = (newStatus, oldStatus, fabricationId, fabricationName, selectElement) => {
    // No confirmation modals needed - all status changes from dropdown are direct
    // Shipped status should only be changed through the dedicated Shipped button
    const updatedFabs = fabricationDrawings.map(f =>
      f.id === fabricationId ? { ...f, status: newStatus } : f
    );
    setFabricationDrawings(updatedFabs);
  };

  // Handle shipped confirmation from dedicated Shipped button
  const handleShippedConfirmation = (fabricationId, fabricationName, currentStatus) => {
    if (currentStatus !== 'Production') {
      setStatusModalConfig({
        title: 'Cannot Mark as Shipped',
        message: `"${fabricationName}" must be in Production status before it can be shipped.`,
        details: [
          'Current status: ' + currentStatus,
          'Required status: Production',
          'Use the status dropdown to change to Production first',
          'Then use the Allocate Glass button to reserve glass',
          'Finally, use this Shipped button to complete the process'
        ],
        type: 'warning',
        fabricationId,
        onConfirm: () => {
          setShowStatusModal(false);
        }
      });
      setShowStatusModal(true);
      return;
    }

    setStatusModalConfig({
      title: 'Mark as Shipped',
      message: `Are you sure you want to mark "${fabricationName}" as Shipped?`,
      details: [
        '🚚 This will permanently remove glass from inventory:',
        '• Reduce total glass count in inventory',
        '• Remove project reservations completely',
        '• Update reserved and stock counts',
        '• This action cannot be undone',
        '• Glass will no longer be available for other projects',
        '',
        '📊 The system will process each glass piece individually',
        '📋 Check console for detailed removal logging'
      ],
      type: 'danger',
      newStatus: 'Shipped',
      fabricationId,
      oldStatus: currentStatus,
      onConfirm: async () => {
        console.log(`🚚 User confirmed shipping for fabrication: ${fabricationName}`);
        
        const success = await removeGlassesAfterShipping(projectName, fabricationId);
        
        if (success) {
          console.log('✅ Glass removal completed successfully, updating fabrication status');
          const updatedFabs = fabricationDrawings.map(f =>
            f.id === fabricationId ? { ...f, status: 'Shipped' } : f
          );
          setFabricationDrawings(updatedFabs);
          setShowStatusModal(false);
          
          // Show success notification
          alert(`✅ Successfully shipped "${fabricationName}"!\n\nGlass has been permanently removed from inventory.\nCheck the console for detailed removal logs.`);
        } else {
          console.error('❌ Glass removal failed');
          alert(`❌ Failed to remove glass from inventory for "${fabricationName}".\n\nPlease check the console for error details and try again.`);
        }
      }
    });
    setShowStatusModal(true);
  };

  const printShippingManifest = (fab, projectData = null) => {
    // Use provided project data or current state
    const projectSections = projectData ? projectData.sections : sections;
    const currentProjectName = projectData ? projectData.name : projectName;
    const projectGlassColor = projectData ? projectData.glassColor : glassColor;
    const projectGlassThickness = projectData ? projectData.glassThickness : glassThickness;
    
    // Get only G sections that are assigned to this specific fabrication
    const assignedGSections = projectSections.filter(section => 
      section.type === 'G' && section.fabricationId === fab.id.toString()
    );
    const totalGlasses = assignedGSections.reduce((total, section) => total + section.glasses.length, 0);
    
    // Create printable content
    const printContent = `
      <html>
        <head>
          <title>Shipping Manifest - ${fab.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .manifest-title {
              font-size: 18px;
              color: #666;
            }
            .fab-info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 30px; 
              margin-bottom: 30px; 
            }
            .info-section h3 {
              margin: 0 0 15px 0;
              color: #2c3e50;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              margin: 8px 0;
            }
            .info-label {
              font-weight: bold;
              min-width: 120px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 15px;
              font-size: 12px;
              font-weight: bold;
              color: white;
            }
            .status-design { background: #2196f3; }
            .status-production { background: #ff9800; }
            .status-ready { background: #9c27b0; }
            .status-shipped { background: #4caf50; }
            .status-delivered { background: #00bcd4; }
            .glasses-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
            }
            .glasses-table th, .glasses-table td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            .glasses-table th { 
              background: #f5f5f5; 
              font-weight: bold; 
            }
            .summary-box {
              background: #f8f9fa;
              border: 1px solid #e1e8ed;
              border-radius: 8px;
              padding: 20px;
              margin-top: 30px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .signature-section {
              margin-top: 50px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 50px;
            }
            .signature-box {
              border-top: 1px solid #333;
              padding-top: 10px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">KATENA RAMPS AND RAILINGS</div>
            <div class="manifest-title">SHIPPING MANIFEST</div>
          </div>
          
          <div class="fab-info">
            <div class="info-section">
              <h3>Fabrication Details</h3>
              <div class="info-row">
                <span class="info-label">Fab:</span>
                <span>${fab.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="status-badge status-${fab.status?.toLowerCase().replace(/ /g, '')}">${fab.status || 'Design'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Project:</span>
                <span>${currentProjectName || 'Current Project'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Glass Color:</span>
                <span>${projectGlassColor || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Thickness:</span>
                <span>${projectGlassThickness || 'N/A'}</span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Shipping Information</h3>
              <div class="info-row">
                <span class="info-label">Ship Date:</span>
                <span>${fab.shippingDate || '_____________'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Expected Arrival:</span>
                <span>${fab.arrivalDate || '_____________'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Delivery Address:</span>
              </div>
              <div style="margin-left: 120px; white-space: pre-line; margin-top: 5px;">
                ${fab.deliveryAddress || 'Address not specified'}
              </div>
            </div>
          </div>
          
          <h3>Items Summary</h3>
          <table class="glasses-table">
            <thead>
              <tr>
                <th>G</th>
                <th>Section</th>
                <th>Width</th>
                <th>Height</th>
                <th>Total Inches</th>
              </tr>
            </thead>
            <tbody>
              ${assignedGSections.map(section => 
                section.glasses.map(glass => `
                  <tr>
                    <td>${section.name}</td>
                    <td>${glass.identifier || ''}</td>
                    <td>${glass.width || ''}</td>
                    <td>${glass.height || ''}</td>
                    <td>${glass.width && glass.height ? calculateInches(glass.width, glass.height) : ''}</td>
                  </tr>
                `).join('')
              ).join('')}
            </tbody>
          </table>
          
          <div class="summary-box">
            <h3>Shipment Summary</h3>
            <div class="summary-row">
              <strong>Total G Sections:</strong>
              <strong>${assignedGSections.length}</strong>
            </div>
            <div class="summary-row">
              <strong>Total Pieces:</strong>
              <strong>${totalGlasses}</strong>
            </div>
            <div class="summary-row">
              <strong>Manifest Date:</strong>
              <strong>${new Date().toLocaleDateString()}</strong>
            </div>
          </div>
          
          <div class="signature-section">
            <div class="signature-box">
              <strong>Prepared By</strong><br>
              Date: _______________
            </div>
            <div class="signature-box">
              <strong>Received By</strong><br>
              Date: _______________
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const deleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSavedProjects(savedProjects.filter(p => p.id !== projectId));
          alert('Project deleted successfully!');
        } else {
          const error = await response.json();
          alert(`Failed to delete project: ${error.error}`);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const editProject = (project) => {
    setProjectName(project.name);
    setGlassColor(project.glassColor);
    setGlassThickness(project.glassThickness);
    setProjectStatus(project.status);
    if (project.fullData) {
      setPreliminaryDrawing(project.fullData.preliminaryDrawing);
      setFabricationDrawings(project.fullData.fabricationDrawings);
      setSections(project.fullData.sections);
    }
    setEditingProject(project);
    setShowAddForm(true);
  };

  const updateProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    const updatedProject = {
      name: projectName,
      glassColor,
      glassThickness,
      status: projectStatus,
      fabricationDrawings,
      sections,
      gSections: sections, // Map sections to gSections for compatibility
      totalInches: calculateTotalInches(),
      fullData: {
        preliminaryDrawing,
        fabricationDrawings,
        sections
      }
    };

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProject)
      });

      if (response.ok) {
        const savedProject = await response.json();
        setSavedProjects(savedProjects.map(p => p.id === editingProject.id ? savedProject : p));
        clearForm();
        setShowAddForm(false);
        alert('Project updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update project: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  const updateProjectStatus = async (projectId, newStatus) => {
    try {
      const projectToUpdate = savedProjects.find(p => p.id === projectId);
      if (!projectToUpdate) {
        alert('Project not found');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...projectToUpdate,
          status: newStatus
        })
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setSavedProjects(savedProjects.map(p => 
          p.id === projectId ? updatedProject : p
        ));
      } else {
        const error = await response.json();
        alert(`Failed to update project status: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status. Please try again.');
    }
  };

  return (
    <div className="projects-container">
      <div className="project-header">
        <h2>PROJECTS</h2>
        <button 
          className="add-project-btn"
          onClick={() => setShowAddForm(true)}
        >+ Add project</button>
      </div>
      <div className="project-content">
        {savedProjects.length === 0 ? (
          <div className="project-card">
            <h3>GETTING STARTED</h3>
            <p>No projects yet. Click "Add project" to create your first project.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {savedProjects.map((project) => (
              <div key={project.id} className="project-info-card">
                <div className="project-info-header">
                  <h4>{project.name}</h4>
                  <select 
                    className={`project-status-dropdown ${project.status.toLowerCase().replace(' ', '-')}`}
                    value={project.status}
                    onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                  >
                    <option value="Started">Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="project-info-body">
                  <div className="project-info-row">
                    <span className="info-label">Glass:</span>
                    <span className="info-value">{project.glassColor} • {project.glassThickness}</span>
                  </div>
                  <div className="project-info-row">
                    <span className="info-label">Sections:</span>
                    <span className="info-value">
                      {project.totalGSections > 0 && `${project.totalGSections} G`}
                      {project.totalGSections > 0 && project.totalDivSections > 0 && ' • '}
                      {project.totalDivSections > 0 && `${project.totalDivSections} Div`}
                    </span>
                  </div>
                  <div className="project-info-row">
                    <span className="info-label">Total Glasses:</span>
                    <span className="info-value">{project.totalGlasses}</span>
                  </div>
                  <div className="project-info-row">
                    <span className="info-label">Fabrication Files:</span>
                    <span className="info-value">{Array.isArray(project.fabricationDrawings) ? project.fabricationDrawings.length : project.fabricationDrawings}</span>
                  </div>
                  <div className="project-info-row">
                    <span className="info-label">Created:</span>
                    <span className="info-value">{project.createdAt}</span>
                  </div>
                </div>
                <div className="project-info-actions">
                  <button 
                    className="project-action-btn edit-btn"
                    onClick={() => editProject(project)}
                  >
                    Edit
                  </button>
                  <button 
                    className="project-action-btn view-btn"
                    onClick={() => setViewingProject(project)}
                  >
                    View
                  </button>
                  <button 
                    className="project-action-btn delete-btn"
                    onClick={() => deleteProject(project.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
      {showAddForm && (
        <div className="add-form-overlay">
          <div className="add-form-modal">
            <button 
              className="modal-close-btn"
              onClick={() => setShowAddForm(false)}
            >
              ×
            </button>
            <h3>Add New Project</h3>
            
            <div className="form-group">
              <label>Project Name:</label>
              <input 
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
              />
            </div>

            <div className="form-group">
              <label>Preliminary Drawing:</label>
              <input 
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.dwg"
                onChange={(e) => setPreliminaryDrawing(e.target.files[0])}
              />
            </div>

            <div className="form-group glass-properties-row">
              <div className="glass-property">
                <label>Glass Color:</label>
                <input 
                  type="text"
                  value={glassColor}
                  onChange={(e) => setGlassColor(e.target.value)}
                  placeholder="e.g., Clear, Bronze, Gray"
                />
              </div>
              <div className="glass-property">
                <label>Glass Thickness:</label>
                <input 
                  type="text"
                  value={glassThickness}
                  onChange={(e) => setGlassThickness(e.target.value)}
                  placeholder="e.g., 6mm, 8mm, 10mm"
                />
              </div>
              <div className="glass-property">
                <label>Project Status:</label>
                <select 
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Planning">Planning</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <div className="fabrication-section">
                <div className="fabrication-header">
                  <button
                    type="button"
                    className="expand-toggle-btn"
                    onClick={() => setFabricationExpanded(!fabricationExpanded)}
                  >
                    {fabricationExpanded ? '▼' : '▶'}
                  </button>
                  <label>Fabrication Drawings:</label>
                  <button
                    type="button"
                    onClick={addFabricationDrawing}
                    className="add-fab-btn"
                  >
                    + Add Fabrication Drawing
                  </button>
                </div>
                
                {fabricationExpanded && (
                  <div className="fabrication-drawings">
                    {fabricationDrawings.map((fab) => (
                      <div key={fab.id} className="fabrication-item">
                        {/* Fabrication Header with Expand/Collapse */}
                        <div className="fab-header-expandable">
                          <button
                            type="button"
                            className="fab-expand-toggle"
                            onClick={() => toggleFabExpanded(fab.id)}
                          >
                            {expandedFabs.has(fab.id) ? '▼' : '▶'}
                          </button>
                          <div className="fab-title-section">
                            <span className="fab-title">{fab.name}</span>
                            <span className={`fab-status-badge ${fab.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                              {fab.status}
                            </span>
                          </div>
                          <div className="fab-summary-info">
                            <span className="fab-total-preview">{calculateFabTotalInches(fab)}" total</span>
                          </div>
                        </div>

                        {/* Fabrication Content - Conditionally Displayed */}
                        {expandedFabs.has(fab.id) && (
                          <div className="fab-content">
                            <div className="fab-header">
                              <input
                                type="text"
                                value={fab.name}
                                onChange={(e) => {
                                  const updatedFabs = fabricationDrawings.map(f =>
                                    f.id === fab.id ? { ...f, name: e.target.value } : f
                                  );
                                  setFabricationDrawings(updatedFabs);
                                }}
                                placeholder="Fabrication name"
                                className="fab-name-input"
                              />
                          <select
                            value={fab.status || 'Design'}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              const oldStatus = fab.status || 'Design';
                              
                              handleStatusConfirmation(newStatus, oldStatus, fab.id, fab.name, e.target);
                            }}
                            className="fab-status-select"
                          >
                            <option value="Waiting Production">Waiting Production</option>
                            <option value="Production">Production</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Installed">Installed</option>
                          </select>
                        </div>
                        
                        <div className="fab-details">
                          <div className="fab-file-section">
                            <label>Drawing File:</label>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.dwg"
                              onChange={(e) => {
                                const updatedFabs = fabricationDrawings.map(f =>
                                  f.id === fab.id ? { ...f, file: e.target.files[0] } : f
                                );
                                setFabricationDrawings(updatedFabs);
                              }}
                              className="fab-file-input"
                            />
                          </div>
                          
                          <div className="fab-glass-allocation-section">
                            <button
                              type="button"
                              className="allocate-glass-btn"
                              onClick={() => checkGlassAllocation(fab.id, fab.name)}
                              title="Check if the exact amount of glass needed for this fabrication is allocated"
                            >
                              📊 Allocate Glass
                            </button>
                            <button
                              type="button"
                              className="shipped-btn"
                              onClick={() => handleShippedConfirmation(fab.id, fab.name, fab.status)}
                              title="Mark this fabrication as shipped and remove glass from inventory"
                              disabled={fab.status !== 'Production'}
                            >
                              🚚 Shipped
                            </button>
                          </div>
                          
                          <div className="fab-shipping-section">
                            <div className="shipping-field">
                              <label>Delivery Address:</label>
                              <textarea
                                value={fab.deliveryAddress || ''}
                                onChange={(e) => {
                                  const updatedFabs = fabricationDrawings.map(f =>
                                    f.id === fab.id ? { ...f, deliveryAddress: e.target.value } : f
                                  );
                                  setFabricationDrawings(updatedFabs);
                                }}
                                placeholder="Enter delivery address..."
                                className="delivery-address-input"
                                rows="3"
                              />
                            </div>
                            
                            <div className="shipping-dates">
                              <div className="date-field">
                                <label>Shipping Date:</label>
                                <input
                                  type="date"
                                  value={fab.shippingDate || ''}
                                  onChange={(e) => {
                                    const updatedFabs = fabricationDrawings.map(f =>
                                      f.id === fab.id ? { ...f, shippingDate: e.target.value } : f
                                    );
                                    setFabricationDrawings(updatedFabs);
                                  }}
                                  className="shipping-date-input"
                                />
                              </div>
                              
                              <div className="date-field">
                                <label>Expected Arrival:</label>
                                <input
                                  type="date"
                                  value={fab.arrivalDate || ''}
                                  onChange={(e) => {
                                    const updatedFabs = fabricationDrawings.map(f =>
                                      f.id === fab.id ? { ...f, arrivalDate: e.target.value } : f
                                    );
                                    setFabricationDrawings(updatedFabs);
                                  }}
                                  className="arrival-date-input"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="fab-sections-toggle">
                          <button
                            type="button"
                            className="sections-toggle-btn"
                            onClick={() => toggleFabSectionsExpanded(fab.id)}
                          >
                            📐 Manage Sections (G & Div)
                            {expandedFabSections.has(fab.id) ? ' ▼' : ' ▶'}
                          </button>
                        </div>

                        {expandedFabSections.has(fab.id) && (
                          <div className="fab-sections-container">
                            <div className="section-type-buttons">
                              <button
                                type="button"
                                onClick={() => addFabSection(fab.id, 'G')}
                                className="add-section-btn g-section-btn"
                              >
                                + Add G Section (Balcony)
                              </button>
                              <button
                                type="button"
                                onClick={() => addFabSection(fab.id, 'Div')}
                                className="add-section-btn div-section-btn"
                              >
                                + Add Div Section (Divider)
                              </button>
                            </div>

                            {(fab.sections || []).map((section) => (
                              <div key={section.id} className="g-section-item">
                                <div className="g-section-header">
                                  <button
                                    type="button"
                                    className="expand-toggle-btn"
                                    onClick={() => toggleFabSectionExpanded(fab.id, section.id)}
                                  >
                                    {section.expanded ? '▼' : '▶'}
                                  </button>
                                  <input 
                                    type="text"
                                    value={section.name}
                                    onChange={(e) => updateFabSection(fab.id, section.id, { name: e.target.value })}
                                    placeholder={`${section.type} section name (e.g., ${section.type}1)`}
                                  />
                                  <span className="section-type-badge">{section.type}</span>
                                  <button
                                    type="button"
                                    className="delete-section-btn"
                                    onClick={() => removeFabSection(fab.id, section.id)}
                                  >
                                    🗑️
                                  </button>
                                </div>

                                {section.expanded && (
                                  <div className="g-section-details">
                                    <div className="g-section-controls">
                                      <div>
                                        <label>Total Inches:</label>
                                        <input
                                          type="text"
                                          value={section.totalInches}
                                          onChange={(e) => updateFabSection(fab.id, section.id, { totalInches: e.target.value })}
                                          placeholder="e.g., 48.5"
                                        />
                                      </div>
                                      {section.type === 'G' && (
                                        <div>
                                          <label>Number of Glasses:</label>
                                          <input
                                            type="number"
                                            value={section.numberOfGlasses}
                                            onChange={(e) => updateFabSection(fab.id, section.id, { numberOfGlasses: e.target.value })}
                                            placeholder="e.g., 3"
                                          />
                                        </div>
                                      )}
                                    </div>

                                    {section.type === 'G' && (
                                      <div className="glasses-list">
                                        <h5>Glass Pieces:</h5>
                                        {(section.glasses || []).map((glass) => (
                                          <div key={glass.id} className="glass-item">
                                            <input
                                              type="text"
                                              value={glass.identifier}
                                              onChange={(e) => {
                                                const updatedGlasses = section.glasses.map(g =>
                                                  g.id === glass.id ? { ...g, identifier: e.target.value } : g
                                                );
                                                updateFabSection(fab.id, section.id, { glasses: updatedGlasses });
                                              }}
                                              placeholder="Glass ID (e.g., A, B, C)"
                                            />
                                            <input
                                              type="number"
                                              step="0.1"
                                              value={glass.width}
                                              onChange={(e) => {
                                                const updatedGlasses = section.glasses.map(g =>
                                                  g.id === glass.id ? { ...g, width: e.target.value } : g
                                                );
                                                updateFabSection(fab.id, section.id, { glasses: updatedGlasses });
                                              }}
                                              placeholder="Width"
                                            />
                                            <input
                                              type="number"
                                              step="0.1"
                                              value={glass.height}
                                              onChange={(e) => {
                                                const updatedGlasses = section.glasses.map(g =>
                                                  g.id === glass.id ? { ...g, height: e.target.value } : g
                                                );
                                                updateFabSection(fab.id, section.id, { glasses: updatedGlasses });
                                              }}
                                              placeholder="Height"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updatedGlasses = section.glasses.filter(g => g.id !== glass.id);
                                                updateFabSection(fab.id, section.id, { glasses: updatedGlasses });
                                              }}
                                              className="remove-glass-btn"
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newGlassId = section.glasses.length > 0 
                                              ? Math.max(...section.glasses.map(g => g.id)) + 1 
                                              : 1;
                                            const updatedGlasses = [...(section.glasses || []), {
                                              id: newGlassId,
                                              identifier: '',
                                              width: '',
                                              height: ''
                                            }];
                                            updateFabSection(fab.id, section.id, { glasses: updatedGlasses });
                                          }}
                                          className="add-glass-btn"
                                        >
                                          + Add Glass
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="fab-summary">
                          <div className="fab-total-inches">
                            <span className="total-label">Total Inches for this Fab:</span>
                            <span className="total-value">{calculateFabTotalInches(fab)}"</span>
                          </div>
                        </div>
                        
                        <div className="fab-actions">
                          <button
                            type="button"
                            onClick={() => printShippingManifest(fab)}
                            className="print-fab-btn"
                          >
                            📋 Print Shipping Manifest
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFabricationDrawing(fab.id)}
                            className="remove-fab-btn"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            </div> {/* End of fabrication-section */}
          </div> {/* End of form-group */}
            </div>

            {/* Legacy Project Sections - Hidden (sections now managed at fabrication level) */}
            <div className="modal-content-wrapper">
              <div>
                <div className="sections-container" style={{ display: 'none' }}>
              <h4>Legacy Project Sections (Deprecated):</h4>
              <div className="section-type-buttons">
                <button
                  type="button"
                  onClick={() => addSection('G')}
                  className="add-section-btn g-section-btn"
                >
                  + Add G Section (Balcony)
                </button>
                <button
                  type="button"
                  onClick={() => addSection('Div')}
                  className="add-section-btn div-section-btn"
                >
                  + Add Div Section (Divider)
                </button>
              </div>
              {sections.map((section) => (
                <div key={section.id} className="g-section-item">
                  <div className="g-section-header">
                    <button
                      type="button"
                      className="expand-toggle-btn"
                      onClick={() => toggleSectionExpanded(section.id)}
                    >
                      {section.expanded ? '▼' : '▶'}
                    </button>
                    <input 
                      type="text"
                      value={section.name}
                      onChange={(e) => {
                        const newSections = sections.map(s => 
                          s.id === section.id ? { ...s, name: e.target.value } : s
                        );
                        setSections(newSections);
                      }}
                      placeholder={`${section.type} section name (e.g., ${section.type}1)`}
                    />
                    {section.type === 'G' && (
                      <select
                        value={section.fabricationId || ''}
                        onChange={(e) => {
                          const newSections = sections.map(s => 
                            s.id === section.id ? { ...s, fabricationId: e.target.value || null } : s
                          );
                          setSections(newSections);
                        }}
                        className="fabrication-assignment-select"
                      >
                        <option value="">Assign to Fab...</option>
                        {fabricationDrawings.map(fab => (
                          <option key={fab.id} value={fab.id}>
                            {fab.name} ({fab.status || 'Design'})
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="total-inches-container">
                      <input 
                        type="text"
                        value={section.totalInches || ''}
                        onChange={(e) => {
                          const newSections = sections.map(s => 
                            s.id === section.id ? { ...s, totalInches: e.target.value } : s
                          );
                          setSections(newSections);
                        }}
                        placeholder="Total inches (e.g., 250+250+23 7/16)"
                      />
                      {section.totalInches && (
                        <div className="calculated-feet">
                          = {calculateInches(section.totalInches).toFixed(2)}"
                        </div>
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => setSections(sections.filter(s => s.id !== section.id))}
                    >
                      Remove {section.type}
                    </button>
                  </div>
                  
                  {section.expanded && (
                    <div className="g-section-glasses">
                      <label>How many glasses in {section.name}?</label>
                      <input 
                        type="number"
                        value={section.numberOfGlasses || ''}
                        onChange={(e) => handleNumberOfGlassesChange(section.id, e.target.value)}
                        placeholder="Number of glasses"
                        min="0"
                      />
                      
                      {section.glasses && section.glasses.length > 0 && (
                      <div className="glasses-list">
                        <h5>Glasses in {section.name}:</h5>
                        {section.glasses.map((glass, index) => (
                          <div key={glass.id} className="glass-detail-item">
                            <span>Glass {index + 1}:</span>
                            <input 
                              type="text"
                              value={glass.identifier || ''}
                              onChange={(e) => {
                                const updatedSections = sections.map(gSection => 
                                  gSection.id === section.id 
                                    ? {
                                        ...gSection, 
                                        glasses: gSection.glasses.map(g => 
                                          g.id === glass.id ? { ...g, identifier: e.target.value } : g
                                        )
                                      }
                                    : gSection
                                );
                                setSections(updatedSections);
                              }}
                              placeholder="ID (A, B, C...)"
                              className="glass-identifier"
                            />
                            <input 
                              type="number"
                              value={glass.width || ''}
                              onChange={(e) => {
                                const updatedSections = sections.map(gSection => 
                                  gSection.id === section.id 
                                    ? {
                                        ...gSection, 
                                        glasses: gSection.glasses.map(g => 
                                          g.id === glass.id ? { ...g, width: e.target.value } : g
                                        )
                                      }
                                    : gSection
                                );
                                setSections(updatedSections);
                              }}
                              placeholder="Width"
                              step="0.1"
                            />
                            <input 
                              type="number"
                              value={glass.height || ''}
                              onChange={(e) => {
                                const updatedSections = sections.map(gSection => 
                                  gSection.id === section.id 
                                    ? {
                                        ...gSection, 
                                        glasses: gSection.glasses.map(g => 
                                          g.id === glass.id ? { ...g, height: e.target.value } : g
                                        )
                                      }
                                    : gSection
                                );
                                setSections(updatedSections);
                              }}
                              placeholder="Height"
                              step="0.1"
                            />
                            <GlassAvailabilityIndicator 
                              width={glass.width}
                              height={glass.height}
                              color={glassColor}
                              thickness={glassThickness}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              ))}

              <div className="form-actions">
                <button 
                  className="close-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="save-btn"
                  onClick={editingProject ? updateProject : saveProject}
                >
                  {editingProject ? 'Update Project' : 'Save Project'}
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingProject && (
        <div className="add-form-overlay">
          <div className="view-modal">
            <button 
              className="modal-close-btn"
              onClick={() => setViewingProject(null)}
            >
              ×
            </button>
            <h3>Project Details: {viewingProject.name}</h3>
            <div className="view-modal-content">
              <div className="view-section">
                <h4>Basic Information</h4>
                <div className="view-info-row">
                  <span>Status:</span>
                  <span className={`view-status ${viewingProject.status.toLowerCase().replace(' ', '-')}`}>
                    {viewingProject.status}
                  </span>
                </div>
                <div className="view-info-row">
                  <span>Created:</span>
                  <span>{viewingProject.createdAt}</span>
                </div>
                <div className="view-info-row">
                  <span>Glass Color:</span>
                  <span>{viewingProject.glassColor}</span>
                </div>
                <div className="view-info-row">
                  <span>Glass Thickness:</span>
                  <span>{viewingProject.glassThickness}</span>
                </div>
              </div>
              
              <div className="view-section">
                <h4>Project Summary</h4>
                <div className="view-info-row">
                  <span>Total Sections:</span>
                  <span>{viewingProject.sections}</span>
                </div>
                <div className="view-info-row">
                  <span>G Sections (Balcony):</span>
                  <span>{viewingProject.totalGSections}</span>
                </div>
                <div className="view-info-row">
                  <span>Div Sections (Divider):</span>
                  <span>{viewingProject.totalDivSections}</span>
                </div>
                <div className="view-info-row">
                  <span>Total Glasses:</span>
                  <span>{viewingProject.totalGlasses}</span>
                </div>
                <div className="view-info-row">
                  <span>Fabrication Drawings:</span>
                  <span>{viewingProject.fabricationDrawings}</span>
                </div>
              </div>
            </div>
            
            {/* Fabrication Details Section */}
            {viewingProject.fullData && viewingProject.fullData.fabricationDrawings && viewingProject.fullData.fabricationDrawings.length > 0 && (
              <div className="fabrication-details-section">
                <h4>Fabrication Details</h4>
                <div className="fab-details-grid">
                  {viewingProject.fullData.fabricationDrawings.map((fab) => {
                    const totalInches = calculateFabTotalInches(fab, viewingProject.fullData.sections);
                    const assignedGSections = viewingProject.fullData.sections.filter(section => 
                      section.type === 'G' && section.fabricationId === fab.id.toString()
                    );
                    const totalGlasses = assignedGSections.reduce((total, section) => total + section.glasses.length, 0);
                    
                    return (
                      <div key={fab.id} className="fab-detail-card">
                        <div className="fab-detail-header">
                          <h5>{fab.name}</h5>
                          <span className={`fab-status-badge status-${fab.status?.toLowerCase().replace(/ /g, '')}`}>
                            {fab.status || 'Design'}
                          </span>
                        </div>
                        
                        <div className="fab-detail-info">
                          <div className="fab-metric">
                            <span className="metric-label">Total Inches:</span>
                            <span className="metric-value">{totalInches}"</span>
                          </div>
                          <div className="fab-metric">
                            <span className="metric-label">G Sections:</span>
                            <span className="metric-value">{assignedGSections.length}</span>
                          </div>
                          <div className="fab-metric">
                            <span className="metric-label">Total Glasses:</span>
                            <span className="metric-value">{totalGlasses}</span>
                          </div>
                          {fab.shippingDate && (
                            <div className="fab-metric">
                              <span className="metric-label">Ship Date:</span>
                              <span className="metric-value">{fab.shippingDate}</span>
                            </div>
                          )}
                          {fab.deliveryAddress && (
                            <div className="fab-metric">
                              <span className="metric-label">Address:</span>
                              <span className="metric-value address-text">{fab.deliveryAddress}</span>
                            </div>
                          )}
                        </div>
                        
                        <button
                          className="print-fab-view-btn"
                          onClick={() => printShippingManifest(fab, viewingProject.fullData)}
                        >
                          📋 Print Manifest
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="view-modal-actions">
              <button 
                className="project-action-btn edit-btn"
                onClick={() => {
                  setViewingProject(null);
                  editProject(viewingProject);
                }}
              >
                Edit Project
              </button>
              <button 
                className="close-btn"
                onClick={() => setViewingProject(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      </div> {/* End of project-content */}

      {/* Status Confirmation Modal */}
      <StatusConfirmationModal
        isOpen={showStatusModal}
        onClose={() => {
          // Reset dropdown to previous value if user cancels
          if (statusModalConfig.selectElement) {
            statusModalConfig.selectElement.value = statusModalConfig.oldStatus;
          }
          setShowStatusModal(false);
        }}
        onConfirm={statusModalConfig.onConfirm}
        title={statusModalConfig.title}
        message={statusModalConfig.message}
        details={statusModalConfig.details}
        type={statusModalConfig.type}
        confirmText="Continue"
        cancelText="Cancel"
      />

    </div> 
  );
}


export default Projects;