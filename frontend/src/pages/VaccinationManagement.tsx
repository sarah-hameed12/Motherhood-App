import { useState, useEffect } from "react";
import { getRequest, postRequest } from "../api/requests";

const VaccinationManagement = () => {
  const [vaccines, setVaccines] = useState([]);
  const [newVaccine, setNewVaccine] = useState({
    name: "",
    description: "",
  });

  const loadVaccines = async () => {
    try {
      const data = await getRequest("/api/admin/vaccines");
      setVaccines(data); // Update state with fetched vaccines
    } catch (error) {
      console.error("Failed to load vaccines", error);
    }
  };

  useEffect(() => {
    loadVaccines();
  }, []);

  const handleAddVaccine = async () => {
    try {
      await postRequest("/api/admin/vaccines", newVaccine);
      loadVaccines(); // Reload the vaccines after adding a new one
    } catch (error) {
      console.error("Failed to add vaccine", error);
    }
  };

  return (
    <div>
      <h2>Vaccination Management</h2>
      <div>
        <input
          type="text"
          value={newVaccine.name}
          onChange={(e) => setNewVaccine({ ...newVaccine, name: e.target.value })}
          placeholder="Vaccine Name"
        />
        <input
          type="text"
          value={newVaccine.description}
          onChange={(e) =>
            setNewVaccine({ ...newVaccine, description: e.target.value })
          }
          placeholder="Description"
        />
        <button onClick={handleAddVaccine}>Add Vaccine</button>
      </div>

      {/* Display existing vaccines */}
      <div>
        <h3>Existing Vaccines</h3>
        {vaccines.length === 0 ? (
          <p>No vaccines available</p>
        ) : (
          vaccines.map((vaccine: any) => (
            <div key={vaccine.id}>
              <p>{vaccine.name}: {vaccine.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VaccinationManagement;