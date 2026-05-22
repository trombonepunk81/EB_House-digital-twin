"""
IFC parsing utilities using IfcOpenShell.
Extracts metadata, elements, and property sets from IFC models.
"""
from typing import Dict, Any, List
import ifcopenshell
import ifcopenshell.util.element as ifc_util


def parse_ifc_summary(filepath: str) -> Dict[str, Any]:
    """
    Parse an IFC file and return a high-level summary.
    Used when a model is uploaded to the server.
    """
    model = ifcopenshell.open(filepath)
    schema = model.schema

    # Count elements by type
    element_types = {}
    for entity in model:
        t = entity.is_a()
        element_types[t] = element_types.get(t, 0) + 1

    # Get spaces (rooms)
    spaces = []
    for space in model.by_type("IfcSpace"):
        spaces.append({
            "id": space.GlobalId,
            "name": space.Name or "Unnamed Space",
            "long_name": space.LongName,
        })

    # Get storeys (floors)
    storeys = []
    for storey in model.by_type("IfcBuildingStorey"):
        storeys.append({
            "id": storey.GlobalId,
            "name": storey.Name or "Unnamed Floor",
            "elevation": storey.Elevation,
        })

    return {
        "schema": schema,
        "element_count": len(list(model)),
        "element_types": element_types,
        "spaces": spaces,
        "storeys": storeys,
        "space_count": len(spaces),
        "storey_count": len(storeys),
    }


def get_element_properties(filepath: str, global_id: str) -> Dict[str, Any]:
    """
    Get all properties for a specific IFC element by GlobalId.
    """
    model = ifcopenshell.open(filepath)
    elements = model.by_guid(global_id)
    if not elements:
        return {}

    element = elements
    psets = ifc_util.get_psets(element)

    return {
        "global_id": global_id,
        "type": element.is_a(),
        "name": getattr(element, "Name", None),
        "description": getattr(element, "Description", None),
        "tag": getattr(element, "Tag", None),
        "property_sets": psets,
    }


def extract_assets_from_ifc(filepath: str) -> List[Dict[str, Any]]:
    """
    Extract a list of potentially trackable assets from an IFC model.
    Focuses on mechanical/electrical/plumbing elements and equipment.
    """
    ASSET_TYPES = [
        "IfcDoor", "IfcWindow", "IfcFurnishingElement",
        "IfcFlowTerminal", "IfcEnergyConversionDevice",
        "IfcFlowMovingDevice", "IfcFlowStorageDevice",
        "IfcLightFixture", "IfcSanitaryTerminal",
        "IfcElectricAppliance", "IfcSpaceHeater",
        "IfcAirTerminal", "IfcPump", "IfcBoiler",
        "IfcChiller", "IfcCoolingTower",
    ]

    model = ifcopenshell.open(filepath)
    assets = []

    for ifc_type in ASSET_TYPES:
        try:
            elements = model.by_type(ifc_type)
            for el in elements:
                psets = ifc_util.get_psets(el)
                assets.append({
                    "ifc_global_id": el.GlobalId,
                    "ifc_type": ifc_type,
                    "name": getattr(el, "Name", None) or ifc_type,
                    "description": getattr(el, "Description", None),
                    "tag": getattr(el, "Tag", None),
                    "property_sets": psets,
                })
        except Exception:
            continue

    return assets
