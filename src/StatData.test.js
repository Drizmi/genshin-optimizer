import { PreprocessFormulas, Formulas, StatData } from "./StatData"
import { FormulaText } from "./Stat"
import { GetDependencies } from "./StatDependency"

describe(`Testing StatData`, () => {
  describe(`PreprocessFormulas()`, () => {
    test(`basic def`, () => {
      const stat = {
        characterDEF: 10,
        def_: 100,
        def: 15
      }, dependencyKeys = ["characterDEF", "def_", "def", "finalDEF"]
      const { initialStats, formula } = PreprocessFormulas(dependencyKeys, stat)
      formula(initialStats)
      expect(initialStats).toHaveProperty("finalDEF", 10 * 2 + 15);
    })
    test(`modifiers`, () => {
      const stat = {
        testVal: 10,
        depVal1: 15,
        depval2: 20,
        modifiers: {
          testVal: {
            depVal1: 2,
            depval2: 3,
          },
        },
      }
      const { initialStats, formula } = PreprocessFormulas(["depVal1", "depval2", "testVal"], stat)
      formula(initialStats)
      expect(initialStats).toHaveProperty("testVal", 10 + 15 * 2 + 20 * 3);
    })
    test("should add modifier if it's part of the dependency list", () => {
      const stat = {
        testVal: 10,
        depVal1: 15,
        depval2: 20,
        modifiers: {
          testVal: {
            depVal1: 2,
            depval2: 3,
          },
        },
      }
      const { initialStats, formula } = PreprocessFormulas(["depVal1", "depval2", "testVal"], stat)
      formula(initialStats)
      expect(initialStats).toHaveProperty("testVal", 10 + 15 * 2 + 20 * 3);
    })
    test("should match Stat", () => {
      //checks for development
      expect(Object.keys(Formulas)).toEqual(expect.arrayContaining(Object.keys(FormulaText)))
      expect(Object.keys(StatData)).toEqual(expect.arrayContaining(Object.keys(Formulas)))
    })

    // Discord ID: 822486382450049024
    // Discord Handle: Derpy#2132
    test("should correctly compute Swirl dmgs", () => {
      const stats = {
        characterLevel: 70,
        enemyLevel: 87,
      }
      const { initialStats, formula } = PreprocessFormulas(GetDependencies({}, ["hydro_swirl_hit"]), stats)
      
      // Sucrose 70/80 vs. Ruin Guard 87
      // Hydro Swirl DMG 753, EM 229, no set / bonus
      // Hydro/Cryo/Electro Swirl DMG 805, EM 269, Viridescent 2-piece
      // Hydro/Cryo/Electro Swirl DMG 1327, EM 269, Viridescent 4-piece
      // Hydro/Cryo/Electro Swirl DMG 1084, EM 434, Viridescent 2-piece
      // Hydro/Cryo/Electro Swirl DMG 1578, EM 434, Viridescent 4-piece

      let tmp
      tmp = { ...initialStats, eleMas: 229 }
      formula(tmp); expect(tmp.hydro_swirl_hit).toApproximate(753)
      
      tmp = { ...initialStats, eleMas: 269, anemo_dmg_: 15 } // 2VV
      formula(tmp); expect(tmp.hydro_swirl_hit).toApproximate(805)

      tmp = { ...initialStats, eleMas: 269, anemo_dmg_: 15 , swirl_dmg_: 60, hydro_enemyRes_: 40 } // 4VV
      formula(tmp); expect(tmp.hydro_swirl_hit).toApproximate(1327)

      tmp = { ...initialStats, eleMas: 434, anemo_dmg_: 15 } // 2VV
      formula(tmp); expect(tmp.hydro_swirl_hit).toApproximate(1084)
      console.log(tmp.hydro_swirl_hit)

      tmp = { ...initialStats, eleMas: 434, anemo_dmg_: 15 , swirl_dmg_: 60, hydro_enemyRes_: 40 } // 4VV
      formula(tmp); expect(tmp.hydro_swirl_hit).toApproximate(1578)
    })
  })
})
